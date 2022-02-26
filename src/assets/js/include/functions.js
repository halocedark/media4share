var TheDate = require(__dirname+'/src/assets/js/utils/date');
window.$ = window.jQuery = require('jquery');
const fs = require('fs');
const IniFile = require(__dirname+'/src/assets/js/utils/IniFile.js');
const ROOTPATH = require('electron-root-path');
const childProcess = require('child_process');
const nodemailer = require("nodemailer");
const express = require('express');
const app = express();
const OS = require('os');
const path = require('path');
const uuid = require('uuid');
const ipcIndexRenderer = require('electron').ipcRenderer;


var MAIN_CONTENT_CONTAINER =  $('#MainContentContainer');
var SIDE_NAV_CONTAINER = $('.side-navbar-container');
var TOP_NAV_CONTAINER = $('.top-navbar-container');

var UPLOAD_REQUESTS = [];
var DOWNLOAD_REQUESTS = [];

var APP_NAME = 'Media4Share';
var APP_URL = 'http://localhost/Media4ShareAPI/';
var API_END_POINT = APP_URL+'api/';
var APP_ICON = 'src/assets/img/logo/logo.png';
var APP_ROOT_PATH = ROOTPATH.rootPath+'/';
var APP_DIR_NAME = __dirname+'/';

const SETTINGS_FILE = 'settings';

var MOUSE_X = 0;
var MOUSE_Y = 0;
var CURRENT_DIR = '';

let formatFileWithIcon;
let extractFileExtension;
let formatSampleRate;
let formatTransferBytes;
let formatBytesToStr;
let formatBytes;
let copyLinkToClipboard;
let saveUserConfig;
let deleteFile;
let getUserConfig;
let isConfigExists;
let uploadFiles;
let openFolder;
let openFile;
let playSound;
let setStartTime;
let getStartTime;
let addUploadRequest;
let getUploadRequests;
let addDownloadRequest;
let getDownloadRequests;
let clearDownloadRequests;
let uniqid;
let sendEmail;
let setCurrentDir;
let getCurrentDir;
let loadIniSettings;
let loadIniSettingsSync;
let setupDefaultIniSettings;
let setupAPISettings;
let getPage;
let sendGetRequest;
let sendPostRequest;
let sendAPIPostRequest;
let sendAPIFormDataRequest;
let getSharingPerm;
let PageLoader;
let getUserNotifications;
let setUserNotificationsRead;
let sendNotification;
let incrementFileDownloads;
let randomRange;
let getJoinedGroups;
let getUserGroups;
let deleteUserGroup;
let initAnimations;
let getMyDirectSharings;
let getMyGroupsSharings;
let unshareFileWithList;
let unshareFilesWithGroup;
let LineChart;
let getFileInfoFromUrl;

// Overrided in Index.js
let rebindEvents;
let setupUserAuth;

// Prevent default drag/drop behaviour
$('html').on('dragover', e =>
{
	e.preventDefault();
	e.stopPropagation();
});
$('html').on('drop', e =>
{
	e.preventDefault();
	e.stopPropagation();
});

$(function()
{

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
// Unshare files list with group
unshareFilesWithGroup = (files) =>
{
	var url = API_END_POINT+'files/unshareListWithGroup';
	var data = 
	{
		sharer: getUserConfig().userId,
		files: files
	}
	return sendAPIPostRequest(url, data);
}
// Unshare file with list
unshareFileWithList = (files) =>
{
	var url = API_END_POINT+'files/unshareWithList';
	var data = 
	{
		userId: getUserConfig().userId,
		files: files
	}
	return sendAPIPostRequest(url, data);
}
// Get direct shared files
getMyDirectSharings = () =>
{
	var url = API_END_POINT+'files/myDirectSharings';
	var data = {
		userId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Get groups shared files
getMyGroupsSharings = () =>
{
	var url = API_END_POINT+'files/myGroupsSharings';
	var data = {
		userId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
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
// Delele user group
deleteUserGroup = (groupId) =>
{
	var url = API_END_POINT+'groups/delete';
	var data = {
		groupId: groupId
	};
	return sendAPIPostRequest(url, data);
}
// Get joined groups
getJoinedGroups = () =>
{
	var url = API_END_POINT+'groups/joinedIn';
	var data = {
		userId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Get user groups
getUserGroups = () =>
{
	var url = API_END_POINT+'groups/mygroups';
	var data = {
		ownerId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Random range
randomRange = (min, max) => 
{ 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// Increment file downloads
incrementFileDownloads = (fileId) =>
{
	var url = API_END_POINT+'files/download';
	var data = {
		fileId: fileId
	};
	return sendAPIPostRequest(url, data);
}
// Set notification read
setUserNotificationsRead = () =>
{
	var url = API_END_POINT+'notifications/readAll';
	var data = {
		userId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Get All user notifications
getUserNotifications = () =>
{
	if ( getUserConfig() == undefined )
		return;

	var url = API_END_POINT+'notifications/index';
	var data = {
		userId: getUserConfig().userId
	};
	return sendAPIPostRequest(url, data);
}
// Send notification
sendNotification = (receiverId, title, desc) =>
{
	var url = API_END_POINT+'notifications/send';
	var data = {
		senderId: getUserConfig().userId,
		receiverId: receiverId,
		title: title,
		desc: desc
	};
	return sendAPIPostRequest(url, data);
}
// Page loader
PageLoader = (visible = true, parent = MAIN_CONTENT_CONTAINER) =>
{
	var loaderHTML = `<div class="overlay flex flex-center" id="loadingScreen" style="background-color: rgba(255, 255, 255, .7); position: absolute;">
							<div>
								<img src="src/assets/img/utils/loader2.gif" alt="">
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
// Get sharing permission
getSharingPerm = (permId, CALLBACK) =>
{
	var url = API_END_POINT+'files/getSharingPerm';
	var data = {
		permId: permId
	};
	var request = sendAPIPostRequest(url, data);
	request.then(response =>
	{
		CALLBACK(response);
	});
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
	// Check login
	if ( !isConfigExists() )
	{
		setupUserAuth();
		return;
	}
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
	// Check login
	if ( !isConfigExists() )
	{
		setupUserAuth();
		return;
	}
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
	// Check login
	if ( !isConfigExists() )
	{
		setupUserAuth();
		return;
	}
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
	// Check login
	if ( !isConfigExists() )
	{
		setupUserAuth();
		return;
	}
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
// Setup ini settings
setupDefaultIniSettings = () =>
{
	if ( fs.existsSync(APP_ROOT_PATH+SETTINGS_FILE+'.ini') )
		return;

	if ( !fs.existsSync(OS.userInfo().homedir+'/Downloads/Media4Share/') )
	{
		fs.mkdirSync(OS.userInfo().homedir+'/Downloads/Media4Share/');
	}
		
	var fini = new IniFile(APP_ROOT_PATH);
	var settings = {
		DOWNLOADS_PATH: OS.userInfo().homedir+'/Downloads/Media4Share/',
		SOUND_AFTER_DOWNLOAD_FINISH: true,
		DISPLAY_DOWNLOAD_COMPLETE_DIALOG: true
	};
	fini.write(SETTINGS_FILE, settings, 'Download_Settings').then(created => {});
}
// Setup API Settings
setupAPISettings = () =>
{
	if ( !fs.existsSync(APP_ROOT_PATH+SETTINGS_FILE+'.ini') )
	{
		deleteFile(APP_ROOT_PATH+'config.json', err =>
		{
			setupUserAuth();
		});
		return;
	}
	var settings = loadIniSettingsSync();
	if ( settings )
	{
		if ( settings.Server_Settings == null )
		{
			deleteFile(APP_ROOT_PATH+'config.json', err =>
			{
				setupUserAuth();
			});
			return;
		}
		APP_URL = 'http://'+settings.Server_Settings.HOSTNAME+'/Media4ShareAPI/';
		API_END_POINT = APP_URL+'api/';
	}
}
// Set current working dir
setCurrentDir = (dir) =>
{
	CURRENT_DIR = dir;
}
// Get current working dir
getCurrentDir = () =>
{
	return CURRENT_DIR;
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
// Add requests
addUploadRequest = (req) =>
{
	UPLOAD_REQUESTS.push(req);
}
// Get requests
getUploadRequests = () =>
{
	return UPLOAD_REQUESTS;
}
// Add requests
addDownloadRequest = (req) =>
{
	DOWNLOAD_REQUESTS.push(req);
}
// Get requests
getDownloadRequests = () =>
{
	return DOWNLOAD_REQUESTS;
}
// Clear requests
clearDownloadRequests = () =>
{
	for (var i = 0; i < DOWNLOAD_REQUESTS.length; i++) 
	{
		DOWNLOAD_REQUESTS[i].abort();
	}
}
// Play sound
playSound = (soundFile = APP_DIR_NAME+'src/assets/audio/mp3/notify.mp3') =>
{
	var soundPlayerContainer = $('#soundPlayerContainer');
	var soundPlayerElement = soundPlayerContainer.find('#soundPlayerElement');

	soundPlayerElement.attr('src', soundFile);
	soundPlayerElement[0].play();
}
// Format file type with its icon
formatFileWithIcon = (filename, link = '') =>
{
	var file = '';
	if ( extractFileExtension( filename ) == 'png'
		|| extractFileExtension( filename ) == 'jpg'
		|| extractFileExtension( filename ) == 'jpeg'
		|| extractFileExtension( filename ) == 'gif'
		|| extractFileExtension( filename ) == 'svg' )
	{
		file = '<img src="'+link+'" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'rar' )
	{
		file = '<img src="src/assets/img/file_types/rar.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'zip' )
	{
		file = '<img src="src/assets/img/file_types/zip.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'mp4'
			|| extractFileExtension( filename ) == 'mpeg'
			|| extractFileExtension( filename ) == 'mkv'
			|| extractFileExtension( filename ) == 'flv'
			|| extractFileExtension( filename ) == 'webp' )
	{
		file = '<img src="src/assets/img/file_types/video.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'pdf' )
	{
		file = '<img src="src/assets/img/file_types/pdf.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'doc'
			|| extractFileExtension( filename ) == 'docx'
			|| extractFileExtension( filename ) == 'docm' )
	{
		file = '<img src="src/assets/img/file_types/doc.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'xls'
			|| extractFileExtension( filename ) == 'xlsx'
			|| extractFileExtension( filename ) == 'xltm'
			|| extractFileExtension( filename ) == 'xltx'
			|| extractFileExtension( filename ) == 'xlsb'
			|| extractFileExtension( filename ) == 'xlsm'
			|| extractFileExtension( filename ) == 'xlt'
			|| extractFileExtension( filename ) == 'xlam'
			|| extractFileExtension( filename ) == 'xla'
			|| extractFileExtension( filename ) == 'xlw' 
			|| extractFileExtension( filename ) == 'xlr' )
	{
		file = '<img src="src/assets/img/file_types/excel.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'txt' )
	{
		file = '<img src="src/assets/img/file_types/txt.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'db' )
	{
		file = '<img src="src/assets/img/file_types/db.png" alt="">';
	}
	else if ( extractFileExtension( filename ) == 'sql' )
	{
		file = '<img src="src/assets/img/file_types/sql.png" alt="">';
	}
	else
	{
		file = '<img src="src/assets/img/file_types/file.png" alt="">';
	}
	return file;
}
// Extract file extension
extractFileExtension = (filename) =>
{
	return path.extname(filename).replace('.', '');
}
// Format Transfer speed
formatTransferBytes = (kbps) =>
{
	if ( kbps > 1024 )
	{
		kbps = (kbps / 1024).toFixed(2)+' MB/s';
	}
	else if ( kbps < 1024 )
	{
		kbps = kbps+' KB/s';
	}
	else
	{
		kbps = 'calculating...';
	}

	return kbps;
}
// Format Sample rate
formatSampleRate = (bytes) =>
{
	if ( bytes >= 1073741824 )
	{
		bytes = (bytes / 1073741824).toFixed(2)+' gbps';
	}
	else if ( bytes >= 1048576 )
	{
		bytes = (bytes / 1048576).toFixed(2)+' mbps';
	}
	else if ( bytes >= 1024 )
	{
		bytes = (bytes / 1024).toFixed(2)+' kbps';
	}
	else if ( bytes > 1 )
	{
		bytes = bytes+' bps';
	}
	else
	{
		bytes = '0 b/s';
	}

	return bytes;
}
// Format bytes
formatBytesToStr = (bytes) =>
{
	if ( bytes >= 1073741824 )
	{
		bytes = (bytes / 1073741824).toFixed(2)+' GB';
	}
	else if ( bytes >= 1048576 )
	{
		bytes = (bytes / 1048576).toFixed(2)+' MB';
	}
	else if ( bytes >= 1024 )
	{
		bytes = (bytes / 1024).toFixed(2)+' KB';
	}
	else if ( bytes > 1 )
	{
		bytes = bytes+' byte';
	}
	else
	{
		bytes = '0 bytes';
	}

	return bytes;
}
// Format bytes
formatBytes = (bytes) =>
{
	var unitObject = {
		bytes: 0,
		unit: ''
	};
	if ( bytes >= 1073741824 )
	{
		bytes = (bytes / 1073741824).toFixed(2);
		unitObject.bytes = bytes;
		unitObject.unit = 'GB';
	}
	else if ( bytes >= 1048576 )
	{
		bytes = (bytes / 1048576).toFixed(2);
		unitObject.bytes = bytes;
		unitObject.unit = 'MB';
	}
	else if ( bytes >= 1024 )
	{
		bytes = (bytes / 1024).toFixed(2);
		unitObject.bytes = bytes;
		unitObject.unit = 'byte';
	}
	else if ( bytes > 1 )
	{
		bytes = bytes;
		unitObject.bytes = bytes;
		unitObject.unit = '';
	}
	else
	{
		bytes;
		unitObject.bytes = bytes;
		unitObject.unit = 'byte';
	}

	return unitObject;
}
// Format time remaining
formatTimeRemaining = (time) =>
{
	var timeleft = '';

	if ( time < 60 )
		timeleft = time+' secs';
	else if ( time > 60 )
		timeleft = (time / 60).toFixed(0)+' mins '+(time % 60)+' secs';
	else if ( time >= 3600 )
		timeleft = (time / 3600).toFixed(0)+' hours '+(time % 3600)+' mins';
	else
		'calculating...';

	return timeleft;
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

});




