let FileExplorer;
let FileDownloader;

$(function()
{

// File Explorer
FileExplorer = function(dir = getUserConfig().userId)
{
	this.dir = dir;
	this.files = async () =>
	{
		var url = API_END_POINT+'FileExplorer/files';
		var data = {
			userId: getUserConfig().userId,
			dir: this.dir
		};
		var response = await sendAPIPostRequest(url, data);
		var promise = new Promise(( resolve, reject ) =>
		{
			if ( response.code == 404 )
			{
				reject(response);
				return;
			}

			resolve(response.data);
		});

		return promise;
	}

	this.folders = async () =>
	{
		var url = API_END_POINT+'FileExplorer/folders';
		var data = {
			userId: getUserConfig().userId,
			dir: this.dir
		};
		var response = await sendAPIPostRequest(url, data);
		var promise = new Promise(( resolve, reject ) =>
		{
			if ( response.code == 404 )
			{
				reject(response);
				return;
			}

			resolve(response.data);
		});

		return promise;
	}

	this.explore = async () =>
	{
		var url = API_END_POINT+'FileExplorer/index';
		var data = {
			userId: getUserConfig().userId,
			dir: this.dir
		};
		var response = await sendAPIPostRequest(url, data);
		var promise = new Promise(( resolve, reject ) =>
		{
			if ( response.code == 404 )
			{
				reject(response);
				return;
			}

			resolve(response.data);
		});

		return promise;
	}

	this.createFolder = async () =>
	{
		var url = API_END_POINT+'FileExplorer/createFolder';
		var data = {
			userId: getUserConfig().userId,
			dir: this.dir
		};
		var response = await sendAPIPostRequest(url, data);
		var promise = new Promise(( resolve, reject ) =>
		{
			if ( response.code == 404 )
			{
				reject(response);
				return;
			}

			resolve(response.data);
		});

		return promise;
	}

	this.renameFolder = async (oldname, newname) =>
	{
		var url = API_END_POINT+'FileExplorer/renameFolder';
		var data = {
			userId: getUserConfig().userId,
			dir: this.dir,
			oldname: oldname,
			newname: newname
		};
		var response = await sendAPIPostRequest(url, data);
		var promise = new Promise(( resolve, reject ) =>
		{
			if ( response.code == 404 )
			{
				reject(response);
				return;
			}

			resolve(response);
		});

		return promise;
	}
}
// Downloads files
FileDownloader = function(fileElement)
{
	let request;
	let DOWNLOAD_START_TIME;
	var SETTINGS = loadIniSettingsSync();
	this.F_SAVE_PATH = SETTINGS.Download_Settings.DOWNLOADS_PATH;
	this.F_SAVE_NAME = '';
	var FELEMENT_ID = 'DOWNLOADING_FILE_'+uniqid();
	var FSIZE = fileElement.data('filesize');
	var FURL = fileElement.data('filelink');
	var FNAME = fileElement.data('filename');
	var FICON = fileElement.find('.icon').html();
	var FINFO = fileElement.find('.info').html();
	var FHTML = FHTML = `<div class="file list-view" id="${FELEMENT_ID}" data-role="FILE" data-folder="DOWNLOADING" data-filesize="${FSIZE}" style="margin-bottom: .5em;">
							<button class="btn-close" data-role="CANCEL_FILE_DOWNLOAD"></button>
							<div class="icon">${FICON}</div>
							<span class="name">${ FNAME.substr(0, 50) }...</span>
							<span class="info">${ formatBytesToStr(FSIZE) }</span>
							<div class="progress" id="progress" style="margin: .5em 0;">
							  	<div class="progress-bar bg-success" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">0%</div>
							</div>
							<span class="text-muted" style="font-weight: 200;" id="downloadStatus"></span>
							<div class="stats-div">
								<div class="stat" id="downloadSpeed">
									<span class="stat-title">Download speed: </span>
									<span class="stat-desc" id="value">Unknown</span>
								</div>
								<div class="stat" id="downloadTimeLeft">
									<span class="stat-title">Timeleft: </span>
									<span class="stat-desc" id="value">0</span>
								</div>
								<div class="stat" id="downloadedBytes">
									<span class="stat-title">Downloaded: </span>
									<span class="stat-desc" id="value">Unknown / ${ formatBytesToStr(FSIZE) }</span>
								</div>
							</div>
							<a href="#" class="link-btn" data-role="SAVE_FILE_AS">
								<i class="fas fa-save"></i>
								Save As
							</a>
						</div>`;
	// Add to Download dialog
	DownloadDialog([FHTML]);
	// Select file element in download dialog
	var DOWNLOADING_FILE_ELEMENT = $('#'+FELEMENT_ID);
	var CANCEL_FILE_DOWNLOAD_BTN = DOWNLOADING_FILE_ELEMENT.find('[data-role="CANCEL_FILE_DOWNLOAD"]');
	var SAVE_FILE_AS_BTN = DOWNLOADING_FILE_ELEMENT.find('[data-role="SAVE_FILE_AS"]');
	// Error Exceptions
	const ERROR_EMPTY_URL = 'File URL is invalid';
	const ERROR_EMPTY_FILENAME = 'File NAME is invalid';
	const ERROR_EMPTY_FILE_ELEMENT = 'File ELEMENT is invalid';
	// Cancel download
	CANCEL_FILE_DOWNLOAD_BTN.off('click');
	CANCEL_FILE_DOWNLOAD_BTN.on('click', e =>
	{
		e.preventDefault();
		PromptConfirmDialog('Confirm Canceling Download', 'Are you sure?').then(confirmed =>
		{
			this.abort();
			this.remove();
			// Refresh Download dialog
			DownloadDialog([], '');
		});	
	});
	// Choose file save name
	SAVE_FILE_AS_BTN.off('click');
	SAVE_FILE_AS_BTN.on('click', e =>
	{
		e.preventDefault();
		PromptInputDialog('Save File As', 'Enter file name...').then(input =>
		{
			if ( input.length > 0 )
				this.setSaveName(input);
		});
	});
	// Download
	this.download = () =>
	{
		if ( FURL == undefined )
		{
			throw ERROR_EMPTY_URL;
			return this;
		}
		request = $.ajax({
		    xhr: function() 
		    {
		        var xhr = new XMLHttpRequest();
				xhr.responseType = 'blob';
				xhr.addEventListener('progress', (e) =>
				{
				    if (e.lengthComputable) 
		            {
		                var percentComplete = (e.loaded / e.total) * 100;
		                // Time Remaining
		                var seconds_elapsed = ( new Date().getTime() - DOWNLOAD_START_TIME ) / 1000;
		                bytes_per_second = e.loaded / seconds_elapsed;
		                //var bytes_per_second = seconds_elapsed ? e.loaded / seconds_elapsed : 0 ;
		                var timeleft = (new Date).getTime() - DOWNLOAD_START_TIME;
		                timeleft = e.total - e.loaded;
		                timeleft = timeleft / bytes_per_second;
		                // Upload speed
		                var Kbytes_per_second = bytes_per_second / 1024 ;
		                var transferSpeed = Math.floor(Kbytes_per_second);
		                //onProgress(e, timeleft.toFixed(0), transferSpeed, percentComplete.toFixed(2));
		                // Update file html
		                DOWNLOADING_FILE_ELEMENT.find('#downloadStatus').text('');
		                DOWNLOADING_FILE_ELEMENT.find('#progress .progress-bar').css('width', percentComplete.toFixed(2)+'%')
		                .text(percentComplete.toFixed(2)+'%');
		                DOWNLOADING_FILE_ELEMENT.find('#downloadSpeed #value').text( formatTransferBytes(transferSpeed) );
		                DOWNLOADING_FILE_ELEMENT.find('#downloadTimeLeft #value').text( formatTimeRemaining(Math.floor(timeleft)) );
		                DOWNLOADING_FILE_ELEMENT.find('#downloadedBytes #value').text( formatBytesToStr(e.loaded)+'/'+formatBytesToStr(FSIZE) );
		            }
				}, false);
		       return xhr;
		    },
		    type: 'GET',
		    url: FURL,
		    data: {},
		    beforeSend: function(e)
		    {
		    	// Set start time
				DOWNLOAD_START_TIME = new Date().getTime();
				//
				DOWNLOADING_FILE_ELEMENT.find('#downloadStatus').text('Preparing...');
		    }
		});

		return this;
	}
	// Save file
	this.saveFile = () =>
	{
		if ( request == undefined )
			return this;

		if ( FNAME == undefined )
		{
			throw ERROR_EMPTY_FILENAME;
			return this;
		}

		request.then(response =>
		{
			if ( fs.existsSync(this.getSavePath()+FNAME) )
				FNAME = FNAME+'_'+uniqid()+'.'+extractFileExtension(FNAME);
			
			if ( this.getSaveName().length > 0 )
				FNAME = this.getSaveName()+'.'+extractFileExtension(FNAME);

			FNAME = FNAME.replace(/\/+$/, '');
			FNAME = FNAME.replace('/', '');
			// Clean file name
			FNAME = this.cleanFileName(FNAME);
			//if ( !fs.existsSync(this.getSavePath()) )
			//	fs.mkdir(this.getSavePath(), { recursive: true }, (error) => {});

			var reader = new FileReader();
		    reader.onload = () =>
		    {
		    	var buffer = new Buffer( reader.result );
		    	fs.writeFile( this.getSavePath()+FNAME, buffer, (err) => 
		    	{
		    		// Delete html after file has been downloaded and created
		    		this.remove();
		    		// Refresh Download dialog
					DownloadDialog([], '');
					// Display download complete dialog
					if ( SETTINGS.Download_Settings.DISPLAY_DOWNLOAD_COMPLETE_DIALOG )
					{
						var fileObject = {
							fullpath: this.getSavePath()+FNAME,
							name: FNAME
						};
						DownloadCompleteDialog(fileObject);
					}
					// Play sound
					if ( SETTINGS.Download_Settings.SOUND_AFTER_DOWNLOAD_FINISH )
					{
						playSound();
					}
					// Increment downloads count
					if (  fileElement.data('fileid') != undefined )
					{
						incrementFileDownloads(fileElement.data('fileid')).then(response =>
						{
							if ( response.code == 404 )
								return;
						});
					}
		    	});
		    };

		    reader.readAsArrayBuffer( response );
		});

		return this;
	}
	// Abort
	this.abort = () =>
	{
		if ( request != undefined )
			return request.abort();
	}
	// Remove download
	this.remove = () =>
	{
		DOWNLOADING_FILE_ELEMENT.remove();
	}
	// Set save path
	this.setSavePath = (path) =>
	{
		this.F_SAVE_PATH = path;
		return this;
	}
	// Get save path
	this.getSavePath = () =>
	{
		return this.F_SAVE_PATH;
	}
	// Set save name
	this.setSaveName = (name) =>
	{
		this.F_SAVE_NAME = name;
		return this;
	}
	// Get save name
	this.getSaveName = () =>
	{
		return this.F_SAVE_NAME;
	}
	// Get request
	this.request = () =>
	{
		return request;
	}
	// Clean file name
	this.cleanFileName = (filename) =>
	{
		const DELIMS = ['/', '\\', '@', '#', ';', ',', ':', '%', '&', 'é', '(', ')', '-', '|', '[', '`', '_', 'ç', 'à', 'à', '=', '*', '+', '§', '?', '؟', '<', '>', 'µ'];
		var strArr = [];
		var resultStr = '';
		// Push to array
		for (var i = 0; i < filename.length; i++) 
		{
			strArr.push(filename[i]);
		}
		// Clean from special chars
		for (var i = 0; i < strArr.length; i++) 
		{
			for (var j = 0; j < DELIMS.length; j++) 
			{
				if ( strArr[i] == DELIMS[j] )
				{
					var index = strArr.indexOf(strArr[i]);
					strArr.splice(index, 1);
				}
			}
		}
		// Rebuild string
		for (var i = 0; i < strArr.length; i++) 
		{
			resultStr += strArr[i];
		}

		return resultStr;
	}
}

});