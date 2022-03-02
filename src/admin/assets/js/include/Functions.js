var TheDate = require(__dirname+'/assets/js/utils/date');
window.$ = window.jQuery = require('jquery');
const fs = require('fs');
const IniFile = require(__dirname+'/assets/js/utils/IniFile.js');
const ROOTPATH = require('electron-root-path');
const childProcess = require('child_process');
const nodemailer = require("nodemailer");
const express = require('express');
const app = express();
const OS = require('os');
const path = require('path');
const uuid = require('uuid');
const ipcIndexRenderer = require('electron').ipcRenderer;


const AP_SIDE_NAVBAR_CONTAINER = $('#AP_SIDE_NAVBAR_CONTAINER');
const AP_MAIN_CONTENT_CONTAINER = $('#AP_MAIN_CONTENT_CONTAINER');

var UPLOAD_REQUESTS = [];
var DOWNLOAD_REQUESTS = [];

var APP_NAME = 'Media4Share';
var APP_URL = 'http://localhost/Media4ShareAPI/';
var API_END_POINT = APP_URL+'api/';
var APP_ICON = 'assets/img/logo/logo.png';
var APP_ROOT_PATH = ROOTPATH.rootPath+'/';
var APP_DIR_NAME = __dirname+'/';

const SETTINGS_FILE = 'settings';

var MOUSE_X = 0;
var MOUSE_Y = 0;

let extractFileExtension;
let copyLinkToClipboard;
let saveUserConfig;
let deleteFile;
let getUserConfig;
let isConfigExists;
let openFolder;
let openFile;
let playSound;
let uniqid;
let sendEmail;
let loadIniSettings;
let loadIniSettingsSync;
let setupAPISettings;
let getPage;
let sendGetRequest;
let sendPostRequest;
let sendAPIPostRequest;
let sendAPIFormDataRequest;
let PageLoader;
let randomRange;
let initAnimations;
let LineChart;
let getAllUsers;
let deleteUserAccount;
let deleteUsersAccounts;
let searchForUsers;
let searchForUnapprovedUsers
let setUserPassword;
let approveUserAccount;
let approveUsersAccounts;
let unapproveUsersAccounts;
let getUserInfo;
let updateUserInfo;
let updateMyInfo;
let getAllPerms;
let getAllRoles;
let getRoleAssignedPerms;
let assignRolePerm;
let unassignRolePerm;
let setUsersRole;
let openUserCPanel;
let restoreServerSettingsToDefault;

// Overrided in Index.js
let AP_rebindEvents;

$(function()
{

// Restore server settings to defaults
restoreServerSettingsToDefault = () =>
{
	var url = API_END_POINT+'admin/server/init';
	var data = {
		adminId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Open user cpanel
openUserCPanel = (userId) =>
{
	var url = API_END_POINT+'admin/users/openCPanel';
	var data = {
		adminId: getUserConfig().userId,
		userId: userId
	};
	return sendAPIPostRequest(url, data);
}
// Set users role
setUsersRole = (list, roleId) =>
{
	var url = API_END_POINT+'admin/users/setListRole';
	var data = {
		adminId: getUserConfig().userId,
		list: list,
		roleId: roleId
	};
	return sendAPIPostRequest(url, data);
}
// UnAssign role perms
unassignRolePerm = (roleId, permId) =>
{
	var url = API_END_POINT+'admin/roles/unassignPerm';
	var data =
	{
		adminId: getUserConfig().userId,
		roleId: roleId,
		permId: permId
	};
	return sendAPIPostRequest(url, data);
}
// Assign role perms
assignRolePerm = (roleId, permId) =>
{
	var url = API_END_POINT+'admin/roles/assignPerm';
	var data =
	{
		adminId: getUserConfig().userId,
		roleId: roleId,
		permId: permId
	};
	return sendAPIPostRequest(url, data);
}
// Get role assigned perms
getRoleAssignedPerms = (roleId) =>
{
	var url = API_END_POINT+'admin/roles/assignedPerms';
	var data =
	{
		adminId: getUserConfig().userId,
		roleId: roleId
	};
	return sendAPIPostRequest(url, data);
}
// Get all roles
getAllRoles = () =>
{
	var url = API_END_POINT+'admin/roles/index';
	var data =
	{
		adminId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Get all permissions
getAllPerms = () =>
{
	var url = API_END_POINT+'admin/permissions/index';
	var data =
	{
		adminId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Update my info
updateMyInfo = (formData) =>
{
	var url = API_END_POINT+'admin/me/update';

	return sendAPIFormDataRequest(url, formData);
}
// Update user info
updateUserInfo = (formData) =>
{
	var url = API_END_POINT+'admin/users/update';
	formData.append('adminId', getUserConfig().userId);
	return sendAPIFormDataRequest(url, formData);
}
// Get user info
getUserInfo = (userId) =>
{
	var url = API_END_POINT+'admin/users/info';
	var data = {
		adminId: getUserConfig().userId,
		userId: userId
	};
	return sendAPIPostRequest(url, data);
}
// Unapprove users accounts
unapproveUsersAccounts = (list) =>
{
	var url = API_END_POINT+'admin/users/unapproveList';
	var data = {
		adminId: getUserConfig().userId,
		list: list
	};
	return sendAPIPostRequest(url, data);
}
// Approve users accounts
approveUsersAccounts = (list) =>
{
	var url = API_END_POINT+'admin/users/approveList';
	var data = {
		adminId: getUserConfig().userId,
		list: list
	};
	return sendAPIPostRequest(url, data);
}
// Approve user account
approveUserAccount = (userId) =>
{
	var url = API_END_POINT+'admin/users/approve';
	var data = {
		adminId: getUserConfig().userId,
		userId: userId
	};
	return sendAPIPostRequest(url, data);
}
// Set user password
setUserPassword = (password, userId) =>
{
	var url = API_END_POINT+'admin/users/setPassword';
	var data = {
		adminId: getUserConfig().userId,
		userId: userId,
		password: password
	};
	return sendAPIPostRequest(url, data);
}
// Search for unapproved users
searchForUnapprovedUsers = (query) =>
{
	var url = API_END_POINT+'admin/users/searchUnapproved';
	var data = {
		adminId: getUserConfig().userId,
		query: query
	};
	return sendAPIPostRequest(url, data);
}
// Search for users
searchForUsers = (query) =>
{
	var url = API_END_POINT+'admin/users/search';
	var data = {
		adminId: getUserConfig().userId,
		query: query
	};
	return sendAPIPostRequest(url, data);
}
// Delete user account
deleteUserAccount = (userId) =>
{
	var url = API_END_POINT+'admin/users/delete';
	var data = {
		userId: userId
	};
	return sendAPIPostRequest(url, data);
}
// Delete users accounts
deleteUsersAccounts = (list) =>
{
	var url = API_END_POINT+'admin/users/deleteList';
	var data = {
		adminId: getUserConfig().userId,
		list: list
	};
	return sendAPIPostRequest(url, data);
}
// Get users waiting approval
getUsersWaitingApproval = () =>
{
	var url = API_END_POINT+'admin/users/unapproved';
	var data = {};
	return sendAPIPostRequest(url, data);
}
// Get all users
getAllUsers = () =>
{
	var url = API_END_POINT+'admin/users/index';
	var data = {};
	return sendAPIPostRequest(url, data);
}
// Get file info from url
getFileInfoFromUrl = (url) =>
{
	return new Promise((resolve, reject) =>
	{
		var xhr = new XMLHttpRequest;
		xhr.open('GET', url);
		xhr.send();
		xhr.addEventListener('progress', (e) =>
		{
			if ( e.lengthComputable )
			{
				xhr.abort();
				resolve(e);
				return;
			}
			else
			{
				reject(e);
			}
		});
		//
	});
}
// Line shart
// Create Line Chart
LineChart = (chartOptions, element) =>
{
	if ( element[0] == undefined )
		return;

	element.html('');
	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);

	$(window).on('resize', drawChart);
	function drawChart() 
	{
		var data = google.visualization.arrayToDataTable(chartOptions.data);

		var options = 
		{
		  title: chartOptions.title,
		  curveType: 'function',
		  legend: { position: 'bottom' },
		  height: 500,
		  colors:['#10B981','#6366F1', '#F59E0B', '#EF4444'],
		  hAxis: {
			title: chartOptions.hAxisTitle
		  },
		  vAxis: {
			title: chartOptions.vAxisTitle		
		  }
		};

		var chart = new google.visualization.LineChart(element[0]);

		chart.draw(data, options);
	}
}
// Initialize animations
initAnimations = () =>
{
	// Repeat bg x
	var bgRepeatX = $('.bg-repeat-x');

	if ( bgRepeatX.length > 0 )
	{
		let animator;
		bgRepeatX.off('mouseenter');
		bgRepeatX.on('mouseenter', e =>
		{
			var animSpeed = 20.05;
			var bgPosX = 0;
			animator = setInterval( () => 
			{

				bgRepeatX.css('background-position-x', bgPosX+'px');
				bgPosX--;

			}, animSpeed * 1);
		}).off('mouseleave')
		.on('mouseleave', e =>
		{
			clearInterval(animator);
		});		
	}
}
// Random range
randomRange = (min, max) => 
{ 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// Page loader
PageLoader = (visible = true, parent = AP_MAIN_CONTENT_CONTAINER) =>
{
	var loaderHTML = `<div class="overlay flex flex-center" id="loadingScreen" style="background-color: rgba(255, 255, 255, .7); position: fixed;">
							<div>
								<img src="assets/img/utils/loader2.gif" alt="">
							</div>
							<div class="my-3" style="padding: .5em 0 0 0; margin-right: .5em;">
								<small class="text-muted" style="font-weight: 300;">Processing your request now, </small>
								<span class="" style="font-weight: 200;font-size: 13px;">please wait...</span>
							</div>
						</div>`;
	// Set position
	parent.css('position', 'relative');
	var loadingScreen = parent.find('#loadingScreen');
	if ( loadingScreen[0] == undefined )
		parent.append(loaderHTML);

	loadingScreen = parent.find('#loadingScreen');
	if ( visible )
		loadingScreen.addClass('active');
	else
		loadingScreen.removeClass('active');
}
// Get page
getPage = (page) =>
{
	var promise = new Promise((resolve, reject) =>
	{
		sendGetRequest(page, response =>
		{
			if ( response.length == 0 )
			{
				reject('Error empty response');
				return;
			}
			resolve(response);
		});
	});

	return promise;
}
// Send Get Request
sendGetRequest = (url, CALLBACK) =>
{
	$.ajax({
		url: url,
		type: 'GET',
		success: function(response)
		{
			CALLBACK(response);
		},
		error: function( jqXHR, textStatus, errorThrown)
		{
			if ( textStatus == 'error' )
			{
				//deleteFile(APP_ROOT_PATH+'config.json', err =>
				//{
				//	setupUserAuth();
					DialogBox('Error', 'Error establishing connection to server!');
				//});
			}
		}
	});
}
// Send Post Request
sendPostRequest = (RequestObject, dataType = 'json') =>
{
	var data = { RequestObject: JSON.stringify(RequestObject) };
	var request = $.ajax({
		url: RequestObject.url,
		type: 'POST',
		dataType,
		data,
		error: function( jqXHR, textStatus, errorThrown)
		{
			if ( textStatus == 'error' )
			{
				//deleteFile(APP_ROOT_PATH+'config.json', err =>
				//{
				//	setupUserAuth();
					DialogBox('Error', 'Error establishing connection to server!');
				//});
			}
		}
	});

	return request;
}
// Send Post Request
sendAPIPostRequest = (url, data) =>
{
	var request = $.ajax({
		url: url,
		type: 'POST',
		data: data,
		success: function(response)
		{
			console.log(response);
		},
		error: function( jqXHR, textStatus, errorThrown)
		{
			if ( textStatus == 'error' )
			{
				//deleteFile(APP_ROOT_PATH+'config.json', err =>
				//{
				//	setupUserAuth();
					DialogBox('Error', 'Error establishing connection to server!');
				//});
			}
		}
	});

	return request;
}
// Send formdata Post Request
sendAPIFormDataRequest = (url, formData) =>
{
	var request = $.ajax({
		url: url,
		type: 'POST',
		processData: false,
		contentType: false,
		data: formData,
		success: function(response)
		{
			console.log(response);
		},
		error: function( jqXHR, textStatus, errorThrown)
		{
			if ( textStatus == 'error' )
			{
				//deleteFile(APP_ROOT_PATH+'config.json', err =>
				//{
				//	setupUserAuth();
					DialogBox('Error', 'Error establishing connection to server!');
				//});
			}
		}
	});

	return request;
}
// Load ini settings
loadIniSettings = (CALLBACK) =>
{
	var fini = new IniFile(APP_ROOT_PATH);
	fini.read(SETTINGS_FILE).then(data =>
	{
		CALLBACK(data);
	});
}
// Load ini settings sync
loadIniSettingsSync = () =>
{
	var fini = new IniFile(APP_ROOT_PATH);
	return fini.readSync(SETTINGS_FILE);
}
// Setup API Settings
setupAPISettings = () =>
{
	var settings = loadIniSettingsSync();
	if ( settings )
	{
		APP_URL = 'http://'+settings.Server_Settings.HOSTNAME+'/Media4ShareAPI/';
		API_END_POINT = APP_URL+'api/';
	}
}
// Send Email
sendEmail = async (to, subject, body) =>
{
	let transporter = nodemailer.createTransport(
	{
		host: "smtp.titan.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'holoolaz@holoola-z.com', // generated ethereal user
			pass: 'abc0663650688', // generated ethereal password
		},
	});

	// send mail with defined transport object
	let info = await transporter.sendMail(
	{
		from: `From ${APP_NAME} <holoolaz@holoola-z.com>`, // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		html: body, // html body
	});

	return info;
}
// Unique id
uniqid = () =>
{
	return uuid.v4();
}
// Play sound
playSound = (soundFile = APP_DIR_NAME+'src/admin/assets/audio/mp3/notify.mp3') =>
{
	var soundPlayerContainer = $('#soundPlayerContainer');
	var soundPlayerElement = soundPlayerContainer.find('#soundPlayerElement');

	soundPlayerElement.attr('src', soundFile);
	soundPlayerElement[0].play();
}
// Extract file extension
extractFileExtension = (filename) =>
{
	return path.extname(filename).replace('.', '');
}
// Copy To Clipboard
copyLinkToClipboard = (element, val) =>
{
	var inputHTML = '<input type="text" id="copyToClipboardHiddenInput" style="display: none;">';
	var input = $(inputHTML).insertAfter(element);
	input = $('#copyToClipboardHiddenInput');
	input.val(val);
	input.focus();
	input.select();
	input[0].setSelectionRange(0, 99999);
	navigator.clipboard.writeText( input.val() );
	input.remove();
}
//Save user data
saveUserConfig = (object, CALLBACK) =>
{
	data = JSON.stringify(object);
	fs.writeFile(ROOTPATH.rootPath+'/config.json', data, (error) => 
	{
		CALLBACK(error);
	});
}
// Delete file
deleteFile = (file, CALLBACK) =>
{
	if (fs.existsSync(file)) 
	{
		fs.unlink(file, (error) =>
		{
			CALLBACK(error);
		});
  	}
}
// Get user data
getUserConfig = () =>
{
	if ( !isConfigExists() )
		return;
	config = fs.readFileSync(APP_ROOT_PATH+'config.json', 'utf-8');
	json = JSON.parse(config);
	return json;
}
// Check config file exists
isConfigExists = () =>
{
	exists = false;
	if ( fs.existsSync(APP_ROOT_PATH+'config.json') )
		exists = true;

	return exists;
}
// Upload files
uploadFiles = (url ,file, progress, beforeUpload) =>
{
	let UPLOAD_START_TIME;
	var request = $.ajax({
	    xhr: function() 
	    {
	        var xhr = new XMLHttpRequest();
	        var lastNow = new Date().getTime();
			var lastKBytes = 0;
	        xhr.upload.addEventListener("progress", (e) =>
	        {
	            if (e.lengthComputable) 
	            {
	                var percentComplete = (e.loaded / e.total) * 100;
	                // Time Remaining
	                var seconds_elapsed = ( new Date().getTime() - UPLOAD_START_TIME ) / 1000;
	                bytes_per_second = e.loaded / seconds_elapsed;
	                //var bytes_per_second = seconds_elapsed ? e.loaded / seconds_elapsed : 0 ;
	                var timeleft = (new Date).getTime() - UPLOAD_START_TIME;
	                timeleft = e.total - e.loaded;
	                timeleft = timeleft / bytes_per_second;
	                // Upload speed
	                var Kbytes_per_second = bytes_per_second / 1024 ;
	                var transferSpeed = Math.floor(Kbytes_per_second);
	                // Upload speed
	                /*
	                var now = (new Date()).getTime();
			        var bytes = e.loaded;
			        var total = e.total;
			        var kbytes = bytes / 1024;
			        var mbytes = kbytes / 1024;
			        var uploadedkBytes = kbytes - lastKBytes;
			        var elapsed = (now - lastNow) / 1000;
			        var kbps =  elapsed ? uploadedkBytes / elapsed : 0 ;
			        lastKBytes = kbytes;
			        lastNow = now;
			        //
					*/
			        //var transferSpeed = kbps.toFixed(0);
			        //
	                progress(e, timeleft.toFixed(0), transferSpeed, percentComplete);
	            }
	        }, false);
	        return xhr;
	    },
	    type: 'POST',
	    contentType: false,
	    processData: false,
	    url: url,
	    data: file,
	    beforeSend: function(e)
	    {
	    	// Set start time
			UPLOAD_START_TIME = new Date().getTime();
	    	beforeUpload(e);
	    }
	});
	// Add request
	addUploadRequest(request);
	return request;
}
// Open folder
openFolder = (folder_path) =>
{
	result = childProcess.exec( 'start \"\" \"'+folder_path+'\"', (err, stdout, stderr) => {} );
	return result;
}
// Open file
openFile = (filepath) =>
{
	result = childProcess.exec( '\"'+filepath+'\"', (err, stdout, stderr) => {});
	return result;
}
// Force delete directory
forceRemoveDir = (dir, CALLBACK) =>
{
	result = childProcess.exec('RMDIR /S /Q \"'+dir+'\"', (err, stdout, stderr) => 
	{
		CALLBACK(err, stdout, stderr);
	});
	return result;
}

});




