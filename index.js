var fs = require('fs'),
	request = require('request'),
	Promise = require("bluebird"),
	cheerio = require('cheerio'),
	bhttp = require('bhttp'),
	mkdirp = require('mkdirp'),
	session = bhttp.session({ headers: {'user-agent': 'Deviant/0.1.0'} }),
	url = 'https://www.deviantart.com/users/login',
	images = []
	counter = 0;

/* Configure */
var config = {
	username: '',
	password: '',
	accountToRip: ''
}

/* Download image */
var download = function(url, filename, callback) {
	request.head(url, function(err, res, body){
		request(url).pipe(fs.createWriteStream(filename)).on('close', function() {});
	});
};

/* Process a gallery page (looped until the script reaches the end of pagination then downloads all images found) */
var processGallery = function(galleryUrl) {
	Promise.try(function() {
		return session.get(galleryUrl);
	}).then(function(res) {
		var $gallery = cheerio.load(res.body.toString());

		var $items = $gallery('.folderview-art a.thumb'),
			itemsLength = $items.length;

		$items.each(function(i,v) {
			if ($(this).data('super-full-img') !== undefined) {
				var data = {
					image: $(this).data('super-full-img'),
					title: $(this).find('img').attr('alt')
				}
				images.push(data);
			} else if ($(this).data('super-img') !== undefined)  {
				var data = {
					image: $(this).data('super-img'),
					title: $(this).find('img').attr('alt')
				}
				images.push(data);
			}
			counter++;
			console.log(counter + " FOUND: " + $(this).find('img').attr('alt'));

			if ((i+1) == itemsLength) {
				if ($gallery('#gallery_pager .pagination .next a:not(.disabled)').length > 0) {
					processGallery('https://' + config.accountToRip + '.deviantart.com' + $gallery('#gallery_pager .pagination .next a:not(.disabled)').attr('href'));
				} else {
					console.log('Downloading ' + images.length + ' images, please be patient...');
					var imageArrLength = images.length;
					for (var i = 0; i < imageArrLength; i++) {
						var filename = images[i].title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
						var ext = images[i].image.split('.').pop();
						download(images[i].image, 'galleries/' + config.accountToRip + '/' + filename + '.' + ext);
					};
				}
			}
		});

	});
}

mkdirp('galleries/' + config.accountToRip, function(err) {
	if (err) {
		throw err;
	}

	Promise.try(function() {
		return session.get(url);
	}).then(function(res) {

		$ = cheerio.load(res.body.toString());

		var validate_token = $('input[name="validate_token"]').val(),
			validate_key = $('input[name="validate_key"]').val();

		var formData = {
			username: config.username,
			password: config.password,
			validate_token: validate_token,
			validate_key: validate_key,
			ref: 'https://www.deviantart.com/users/loggedin',
			remember_me: 1
		}

		session.post(url, formData, {}, function(err, res) {
			var $response = cheerio.load(res.body.toString());
			console.log('Processing gallery for ' + config.accountToRip + ', hang tight!');
			processGallery('https://' + config.accountToRip + '.deviantart.com/gallery/');
		});

	});

});
