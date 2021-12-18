var express = require('express');
var router = express.Router();


// Require our controllers.
var blueprint_controller = require('../controllers/blueprintController');
var gun_controller = require('../controllers/gunController');
var att_controller = require('../controllers/attController');
var game_controller = require('../controllers/gameController');
var wc_controller = require('../controllers/weaponClassController');
var atc_controller = require('../controllers/atcController');

// Get request for search bar
router.get('/search/:query', blueprint_controller.search);

/// Gun ROUTES ///

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/gun/create', gun_controller.pre_gun_create_get);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/game/:id/gun/create', gun_controller.gun_create_get);

// POST request for creating Book.
router.post('/game/:id/gun/create', gun_controller.gun_create_post);

// GET request to delete Book.
router.get('/guns/:id/delete', gun_controller.gun_delete_get);

// POST request to delete Book.
router.post('/guns/:id/delete', gun_controller.gun_delete_post);

// GET request to update Book.
router.get('/game/:gameid/guns/:id/update', gun_controller.gun_update_get);

// POST request to update Book.
router.post('/game/:id/guns/:id/update', gun_controller.gun_update_post);

// GET request for one Gun.
router.get('/guns/:id', gun_controller.gun_detail);

// GET request for list of all Guns.
router.get('/guns', gun_controller.gun_list);



/// Attachment ROUTES ///

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/attachment/create', att_controller.attachment_create_get);

// POST request for creating Book.
router.post('/attachment/create', att_controller.attachment_create_post);

// GET request to delete Book.
router.get('/attachments/:id/delete', att_controller.attachment_delete_get);

// POST request to delete Book.
router.post('/attachments/:id/delete', att_controller.attachment_delete_post);

// GET request to update Book.
router.get('/attachments/:id/update', att_controller.attachment_update_get);

// POST request to update Book.
router.post('/attachments/:id/update', att_controller.attachment_update_post);

// GET request for one Gun.
router.get('/attachments/:id', att_controller.att_detail);

// GET request for list of all Guns.
router.get('/attachments', att_controller.att_list);


/// Game ROUTES ///

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/game/create', game_controller.game_create_get);

// POST request for creating Book.
router.post('/game/create', game_controller.game_create_post);

// GET request to delete Book.
router.get('/game/:id/delete', game_controller.game_delete_get);

// POST request to delete Book.
router.post('/game/:id/delete', game_controller.game_delete_post);

// GET request to update Book.
router.get('/game/:id/update', game_controller.game_update_get);

// POST request to update Book.
router.post('/game/:id/update', game_controller.game_update_post);

// GET request for one Gun.
router.get('/game/:id', game_controller.game_detail);

// GET request for list of all Guns.
router.get('/games', game_controller.game_list);





/// Blueprint ROUTES ///

// GET catalog home page.
router.get('/', blueprint_controller.index);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/blueprint/create', blueprint_controller.pre_bp_create_get);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/guns/:id/createBlueprint', blueprint_controller.bp_create_get);

// POST request for creating Book.
router.post('/guns/:id/createBlueprint', blueprint_controller.bp_create_post);

// GET request to delete Book.
router.get('/blueprints/:id/delete', blueprint_controller.bp_delete_get);

// POST request to delete Book.
router.post('/blueprints/:id/delete', blueprint_controller.bp_delete_post);

// GET request to update Book.
router.get('/guns/:gunid/blueprint/:id/update', blueprint_controller.bp_update_get);

// POST request to update Book.
router.post('/guns/:gunid/blueprint/:id/update', blueprint_controller.bp_update_post);

// GET request for one Book.
router.get('/blueprints/:id', blueprint_controller.bp_detail);

// GET request for list of all Book.
router.get('/blueprints', blueprint_controller.bp_list);



/// Weapon Class ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get('/weaponClass/create', wc_controller.wc_create_get);

// // POST request for creating Author.
router.post('/weaponClass/create', wc_controller.wc_create_post);

// GET request to delete Author.
router.get('/weaponClass/:id/delete', wc_controller.wc_delete_get);

// POST request to delete Author
router.post('/weaponClass/:id/delete', wc_controller.wc_delete_post);

// GET request to update Author.
router.get('/weaponClass/:id/update', wc_controller.wc_update_get);

// POST request to update Author.
router.post('/weaponClass/:id/update', wc_controller.wc_update_post);

// // GET request for one Author.
router.get('/weaponClass/:id', wc_controller.wc_detail);



/// Attachment Category ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get('/attachmentCategory/create', atc_controller.atc_create_get);

// // POST request for creating Author.
router.post('/attachmentCategory/create', atc_controller.atc_create_post);

// // GET request to delete Author.
router.get('/attachmentCategory/:id/delete', atc_controller.atc_delete_get);

// POST request to delete Author
router.post('/attachmentCategory/:id/delete', atc_controller.atc_delete_post);

// GET request to update Author.
router.get('/attachmentCategory/:id/update', atc_controller.atc_update_get);

// POST request to update Author.
router.post('/attachmentCategory/:id/update', atc_controller.atc_update_post);

// // GET request for one Author.
router.get('/attachmentCategory/:id', atc_controller.atc_detail);


module.exports = router;