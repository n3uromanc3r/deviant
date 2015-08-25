deviant
=======

## Installation

1. `git clone git@github.com:n3uromanc3r/deviant.git`
2. `cd deviant`
3. `npm install`


## Configure

Open 'index.js' and edit the following section:

```
var config = {
	username: 'yourusernamehere', 
	password: 'yourpasswordhere',
	accountToRip: 'n3uromanc3r'
}
```

The accountToRip takes a DeviantArt account username, so the above config will download the entire gallery for n3uromanc3r, located at https://n3uromanc3r.deviantart.com/gallery/


## Run

1. `npm index.js`
