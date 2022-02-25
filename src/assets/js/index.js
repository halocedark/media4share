$(function()
{

// Setup app updates
function setupAppUpdates()
{
	var options =
	{
		version: '',
		percent: 0,
		bytesPerSecond: 0,
		transferred: 0,
		total: 0
	};
	ipcIndexRenderer.on('checking-for-update', (info) =>
	{
		// Display loader
		TOP_NAV_CONTAINER.find('#loader').css('display', 'block')
		.find('#text').text(' Checking for updates...');
	});
	ipcIndexRenderer.on('update-available', (info) =>
	{
		// Hide loader
		TOP_NAV_CONTAINER.find('#loader').css('display', 'none')
		.find('#text').text('');
		//
		options.version = info.version;
		console.log(info);
	});
	ipcIndexRenderer.on('update-not-available', (info) =>
	{
		// Hide loader
		TOP_NAV_CONTAINER.find('#loader').css('display', 'none')
		.find('#text').text('');
	});
	ipcIndexRenderer.on('update-error', (info) =>
	{
		// Hide loader
		TOP_NAV_CONTAINER.find('#loader').css('display', 'none')
		.find('#text').text('');
	});
	ipcIndexRenderer.on('download-update-progress', (progressInfo) =>
	{
		// Display update dialog
		UpdateAppDialog(progressInfo);
	});
}
// Setup navbar
function setupNavbar()
{
	// Display side nav bar
	SIDE_NAV_CONTAINER.show(0);
	// Display top navbar
	TOP_NAV_CONTAINER.show(0);

	var avatarDiv = SIDE_NAV_CONTAINER.find('.avatar');
	var detailsDiv = SIDE_NAV_CONTAINER.find('.details');
	var sideNavBarMenu = SIDE_NAV_CONTAINER.find('.middle #sideNavBarMenu');
	var notificationBTN = SIDE_NAV_CONTAINER.find('.header #notificationBTN');

	var searchBTN = TOP_NAV_CONTAINER.find('.navmenu #searchBTN');
	var searchBox = TOP_NAV_CONTAINER.find('#searchBox');
	var closeSearchBoxBTN = searchBox.find('.close-div #closeSearchBoxBTN');
	var changeViewBTN = TOP_NAV_CONTAINER.find('.navmenu #changeViewBTN');
	var searchFilesInput = searchBox.find('#searchFilesInput');
	var uploadBTN = TOP_NAV_CONTAINER.find('.navmenu #uploadBTN');
	var emptyTrashBTN = TOP_NAV_CONTAINER.find('.navmenu #emptyTrashBTN');
	var createFolderBTN = TOP_NAV_CONTAINER.find('.navmenu #createFolderBTN');

	var trashedFilesNL = sideNavBarMenu.find('#trashedFilesNL');

	var notificationContainer = $('#notificationContainer');
	var notificationsWrapper = notificationContainer.find('#notificationsWrapper');

	// Hide empty trash button
	emptyTrashBTN.fadeOut(500);
	// Display user details
	var avatar = getUserConfig().userAvatar;
	if ( avatar == null || avatar == 0 )
		avatar = APP_DIR_NAME+'src/assets/img/utils/user.png';

	avatarDiv.find('img').attr('src', avatar);
	detailsDiv.find('.fullname').text( getUserConfig().fullName );
	detailsDiv.find('.email').text( getUserConfig().userEmail );

	// Change page
	sideNavBarMenu.off('click');
	sideNavBarMenu.on('click', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		
		if ( target.data('role') == 'NAV_LINK' )
		{
			var href = target.attr('href');

			var page = APP_DIR_NAME+href;
			if ( href.length == 0 || href == '#' )
				return;

			getPage(page).then(response =>
			{
				MAIN_CONTENT_CONTAINER.html(response);
				// Re assign events
				rebindEvents();
				// Set navlink active
				sideNavBarMenu.find('[data-role="NAV_LINK"], [data-role="NAV_LINK_DROP_DOWN_TOGGLER"]').removeClass('active');
				sideNavBarMenu.find('li .dropdown-accordion').slideUp(50);
				target.addClass('active');
			});
		}
		else if ( target.data('role') == 'NAV_LINK_DROP_DOWN_TOGGLER' )
		{
			sideNavBarMenu.find('li .dropdown-accordion').slideUp(50);
			target.siblings('.dropdown-accordion').slideDown(200)
			.parent().find('li .dropdown-accordion').slideUp(50);
			// Set navlink active
			sideNavBarMenu.find('[data-role="NAV_LINK"], [data-role="NAV_LINK_DROP_DOWN_TOGGLER"]').removeClass('active');
			target.addClass('active');
		}
		else if ( target.data('role') == 'ACCORDION_NAV_LINK' )
		{
			var href = target.attr('href');

			var page = APP_DIR_NAME+href;
			if ( href.length == 0 || href == '#' )
				return;

			getPage(page).then(response =>
			{
				MAIN_CONTENT_CONTAINER.html(response);
				// Re assign events
				rebindEvents();
			});
		}
		else if ( target.data('role') == 'ACCORDION_SHARING_GROUP' )
		{
			var groupId = target.data('groupid');
			var href = target.attr('href');

			var page = APP_DIR_NAME+href;
			if ( href.length == 0 || href == '#' )
				return;

			getPage(page).then(response =>
			{
				MAIN_CONTENT_CONTAINER.html(response);
				//
				setupFilesSharedWithMeInGroup(groupId);
			});
		}
		else if ( target.data('role') == 'NAV_LINK_LOGOUT' )
		{
			PromptConfirmDialog('Confirm Logout', 'Are you sure?').then(confirmed =>
			{
				deleteFile(APP_ROOT_PATH+'config.json', err =>
				{
					setupUserAuth();
				});
			});
		}
		else
			return;
	});
	// Toggle search box
	searchBTN.off('click');
	searchBTN.on('click', e =>
	{
		e.preventDefault();
		searchBox.toggleClass('active');
	});
	// Close search box
	closeSearchBoxBTN.off('click');
	closeSearchBoxBTN.on('click', () =>
	{
		searchBox.removeClass('active');
	});
	// Change files and folders view
	changeViewBTN.off('click');
	changeViewBTN.on('click', (e) =>
	{
		var target = $(e.target);
		var gridIcon = 'fas fa-th';
		var listIcon = 'fas fa-bars';
		var customCol = $('.row .custom-col');
		var view = customCol.data('view');
		var fileDiv = customCol.find('.file');

		if ( view == 'LIST' )
		{
			customCol.removeClass('col-md-12').addClass('col-md');
			fileDiv.removeClass('list-view').addClass('grid-view');
			customCol.data('view', 'GRID').attr('data-view', 'GRID');
		}
		else
		{
			customCol.removeClass('col-md').addClass('col-md-12');
			fileDiv.removeClass('grid-view').addClass('list-view');
			customCol.data('view', 'LIST').attr('data-view', 'LIST');
		}

	});
	// Open Uploader
	uploadBTN.off('click');
	uploadBTN.on('click', e =>
	{
		e.preventDefault();
		UploadDialog();
	});
	// Empty trash
	emptyTrashBTN.off('click');
	emptyTrashBTN.on('click', e =>
	{
		e.preventDefault();
		PromptConfirmDialog('Confirm', 'Are you sure?').then(confirmed =>
		{
			var url = API_END_POINT+'files/emptyTrash';
			var data = {
				userId: getUserConfig().userId,
				folder: 'TRASH'
			};
			// Display loader
			PageLoader();
			sendAPIPostRequest(url, data).then(response =>
			{
				// Rebind events
				rebindEvents();
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}

				DialogBox('Notice', response.message);
			});
		});
	});
	// Create folder
	createFolderBTN.off('click');
	createFolderBTN.on('click', e =>
	{
		CreateFolderDialog();
	});
	// Mouse position
	$('body').off('mousemove');
	$('body').on('mousemove', e =>
	{
		MOUSE_X = e.clientX;
		MOUSE_Y = e.clientY;
	});
	// Open file or folder context menu
	$('body').off('contextmenu');
	$('body').on('contextmenu', e =>
	{
		var target = $(e.target);
		// Hide context menus
		FileContextMenu(null, false);
		FolderContextMenu(null, false);

		if ( target.data('role') == 'FILE' 
			|| target.data('role') == 'FILE_CONTEXT_MENU' )
		{
			if ( target.data('folder') == 'DOWNLOADING' )
				return;

			var fileId = target.data('fileid');
			FileContextMenu(target);
		}
		else if ( target.data('role') == 'FOLDER' )
		{
			FolderContextMenu(target);
		}
		else
			return;
	}).off('click').on('click', (e) =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'FILE_CONTEXT_MENU' )
		{
			var fileElement = target.closest('[data-role="FILE"]')
			var fileId = fileElement.data('fileid');
			FileContextMenu(fileElement);
		}
		else
		{
			FileContextMenu(null, false);
			FolderContextMenu(null, false);
		}
		// Close notification container
		if ( notificationContainer.hasClass('active')
			&& target.attr('id') != notificationBTN.attr('id') )
		{
			notificationContainer.removeClass('active');
		}
	});
	// Open notifications container
	notificationBTN.off('click');
	notificationBTN.on('click', e =>
	{
		notificationContainer.toggleClass('active')
		.css('top', MOUSE_Y+'px').css('left', MOUSE_X+'px');

		setUserNotificationsRead().then(response =>
		{
			if ( response.code == 404 )
				return;

			if ( notificationBTN.hasClass('active') )
				notificationBTN.removeClass('active');
		});
	});
	// Get trashed file count
	var filesCount = 0;
	var foldersCount = 0;
	getTrashedFilesCount();
	function getTrashedFilesCount()
	{
		var url = API_END_POINT+'files/trashed';
		var data = {
			userId: getUserConfig().userId,
			folder: 'TRASH'
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			trashedFilesNL.find('.label').text('Trash (0)');
			if ( response.code == 404 )
				return;

			filesCount = response.data.length;
			trashedFilesNL.find('.label').text('Trash ('+filesCount+')');
			getTrashedFoldersCount();
		});
	}
	// Get trashed folders count
	function getTrashedFoldersCount()
	{
		// Get trashed folders count
		var fExplorer = new FileExplorer('');
		fExplorer.folders().then(data =>
		{
			foldersCount = data.trashed.length + filesCount;
			trashedFilesNL.find('.label').text('Trash ('+foldersCount+')');
		});
	}
}
// User auth
setupUserAuth = () =>
{
	// Hide side nav bar
	SIDE_NAV_CONTAINER.hide(0);
	// Hide top navbar
	TOP_NAV_CONTAINER.hide(0);
	var userAuthContainer = $('.user-auth-container');
	var signUpWrapper = userAuthContainer.find('.signup-wrapper');
	var userSignupForm = signUpWrapper.find('#userSignupForm');
	var switchToSignInForm = userSignupForm.find('#switchToSignInForm');

	var loginWrapper = userAuthContainer.find('.login-wrapper');
	var userSigninForm = loginWrapper.find('#userSigninForm');
	var switchToSignUpForm = userSigninForm.find('#switchToSignUpForm');

	var serverSettingsForm = loginWrapper.find('#serverSettingsForm');
	var signupServerSettingsForm = signUpWrapper.find('#signupServerSettingsForm');

	var loader = userAuthContainer.find('#loader');
	// Display user auth container
	userAuthContainer.show(50);	
	// Hide other containers
	SIDE_NAV_CONTAINER.hide(50);
	MAIN_CONTENT_CONTAINER.hide(50);
	// Switch to login form
	switchToSignInForm.off('click');
	switchToSignInForm.on('click', e =>
	{
		e.preventDefault();
		signUpWrapper.slideUp(200);
		loginWrapper.slideDown(200);
	});
	// Switch to signup form
	switchToSignUpForm.off('click');
	switchToSignUpForm.on('click', e =>
	{
		e.preventDefault();
		loginWrapper.slideUp(200);
		signUpWrapper.slideDown(200);
	});
	//Sign up
	userSignupForm.off('submit');
	userSignupForm.on('submit', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		// Check if server hostname is valid
		if ( signupServerSettingsForm.find('#sssfServerHostnameInput').val() == '' )
		{
			DialogBox('Error', 'Please enter server hostname!');
			return;
		}
		// Submit sign up server connection form
		
		signupServerSettingsForm.trigger('submit');
	});
	// Sign up Server settings
	signupServerSettingsForm.off('submit');
	signupServerSettingsForm.on('submit', e =>
	{
		e.preventDefault();
		var target = signupServerSettingsForm;
		var fini = new IniFile(APP_ROOT_PATH);
		var Server_Settings = {
			HOSTNAME: $.trim(target.find('#sssfServerHostnameInput').val())
		};
		
		fini.write(SETTINGS_FILE, Server_Settings, 'Server_Settings').then(created =>
		{
			// Change API Settings
			setupAPISettings();
			// Load hostname
			loadServerHostname();
			// Login
			signup(userSignupForm);
		});
	});
	// Sign in
	userSigninForm.off('submit');
	userSigninForm.on('submit', e =>
	{
		e.preventDefault();
		// Check if server hostname is valid
		if ( serverSettingsForm.find('#ssfServerHostnameInput').val() == '' )
		{
			DialogBox('Error', 'Please enter server hostname!');
			return;
		}
		// Submit server connection form
		serverSettingsForm.trigger('submit');
	});
	// Sign in Server settings
	serverSettingsForm.off('submit');
	serverSettingsForm.on('submit', e =>
	{
		e.preventDefault();
		var target = serverSettingsForm;
		var fini = new IniFile(APP_ROOT_PATH);
		var Server_Settings = {
			HOSTNAME: $.trim(target.find('#ssfServerHostnameInput').val())
		};
		
		fini.write(SETTINGS_FILE, Server_Settings, 'Server_Settings').then(created =>
		{
			// Change API Settings
			setupAPISettings();
			// Load hostname
			loadServerHostname();
			// Login
			login(userSigninForm);
		});
	});
	// Load server hostname
	function loadServerHostname()
	{
		var settings = loadIniSettingsSync();
		if ( settings )
		{
			if ( settings.Server_Settings != undefined )
			{
				serverSettingsForm.find('#ssfServerHostnameInput').val( settings.Server_Settings.HOSTNAME );
				signupServerSettingsForm.find('#sssfServerHostnameInput').val( settings.Server_Settings.HOSTNAME );
			}
		}
	}

	// Login
	function login(target)
	{
		var username = target.find('#lUsername').val();
		var password = target.find('#lPassword').val();
		// Display loader
		loader.show(50);
		var url = API_END_POINT+'users/login';
		$.ajax({
			url: url,
			type: 'POST',
			data: {
				username: username,
				password: password
			},
			success: function(response)
			{
				// Hide loader
				loader.hide(50);
				var userData = response.user;
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				//Save config
				saveUserConfig(userData, () => 
				{
					// Hide container
					userAuthContainer.hide(50);
					// Show other containers
					MAIN_CONTENT_CONTAINER.show(50);
					// Rebind events
					rebindEvents();
				});
				// Reset form
				target[0].reset();
			}
		});
	}
	// Sign up
	function signup(target)
	{
		var fullName = target.find('#sName').val();
		var username = target.find('#sUsername').val();
		var email = target.find('#sEmail').val();
		var password = target.find('#sPassword').val();

		var url = API_END_POINT+'users/add.php';
		// Display loader
		loader.show(50);
		$.ajax({
			url: url,
			type: 'POST',
			data: {
				fullname: fullName,
				username: username,
				email: email,
				password: password,
				isVerified: 1
			},
			success: function(response)
			{
				if ( response.code == 404 )
					return;

				// Hide loader
				loader.hide(50);
				//Reset form
				target[0].reset();
				var user = response.registered;
				// Send verification email
				/*
				var veriURL = APP_URL+'verify-email?code='+user.code;
				var body = `<div class="confirmation-container" style="border-top: 6px solid #ff0066; overflow: auto;text-align: center;">
								<div class="wrapper" style="padding: 1em;">
									<div class="header" style="border-bottom: 1px solid #EAE6E8; padding: 1.5em 0;">
										<div>
											<img src="${APP_URL+APP_ICON}" alt="" style="width: 80px;">
										</div>
										<h1 style="font-weight: 400; font-size: 25px;">Email Verification</h1>
									</div>
									<div class="middle">
										<p style="font-size: 17px; color: #404040;">To verify your email address click on the button below.</p>
										<p style="font-size: 17px; color: #404040;">If you did not make this request, then simply ignore this email.</p>
										<p style="font-size: 17px; color: #404040;">You have registered using the following details:</p>
										<p>Login: <small>${email}</small></p>
										<p>Password: <small>${password}</small></p>
										<a href="${veriURL}" target="_blank" style="padding: 1em 2em; margin: 1.5em 0; display: inline-block; background: #ff0066; color: #ffffff; border-radius: 5px; font-size: 12px; text-transform: uppercase; text-decoration: none;">Verify your email address</a>
									</div>
									<div class="footer">
										<p style="font-size: 17px; color: #404040;">If you have trouble paste this link into your web browser:</p>
										<a target="_blank" style="font-weight: 300;font-size: 13px;color: #0071ff;text-decoration: none;display: inline-block;padding: .2em .3em;" href="${veriURL}">${veriURL}</a>
										<div class="copyright" style="border-top: 1px solid #EAE6E8; margin-top: 1em;">
											<p style="font-size: 14px; color: #808080">Copyright &copy; Holoola-z 2021</p>
											<p style="margin:  0;font-size: 14px; color: #808080">All rights reserved.</p>
										</div>
									</div>
								</div>
							</div>`;
				sendEmail(email, APP_NAME+' Email Verification', body);
				DialogBox('Info', 'Registration complete, we sent verification link to your email.');
				*/
				DialogBox('Info', response.message);
			}
		});
	}

}
// Setup statistics
function setupStatistics()
{
	var statisticsContainer = $('#statisticsContainer');
	if ( statisticsContainer[0] == undefined )
		return;

	var totalFilesStat = statisticsContainer.find('#totalFilesStat');
	var totalSharingsStat = statisticsContainer.find('#totalSharingsStat');
	var totalDownloadsStat = statisticsContainer.find('#totalDownloadsStat');

	var chartDiv01 = statisticsContainer.find('#chartDiv01');
	var chartDiv02 = statisticsContainer.find('#chartDiv02');

	// Get stats
	getStats('STAT_TOTAL_FILES');
	getStats('STAT_TOTAL_DOWNLOADS');
	getStats('STAT_TOTAL_SHARINGS');
	function getStats(statName)
	{
		if ( statName == 'STAT_TOTAL_FILES' )
		{
			var url = API_END_POINT+'statistics/me/totalFiles';
			var data = {
				userId: getUserConfig().userId
			};
			sendAPIPostRequest(url, data).then(response =>
			{
				if ( response.code == 404 )
					return;

				var data = response.data;
				// Set total
				totalFilesStat.find('.stat-count').text('('+data.total+') files.');
				// Draw chart
				var dataTable = [
					['Date', 'Number of files']
				];
				// Loop
				$.each(data.stat, (k,v) =>
				{
					dataTable.push([v.createdDate, parseInt(v.total)]);
				});
				if ( dataTable.length < 2 )
					return;

				var options = {
					data: dataTable,
					title: 'Total Files.',
					hAxisTitle: 'Date',
					vAxisTitle: 'Number of files.'
				};
				LineChart(options, chartDiv01);
			});
		}
		else if ( statName == 'STAT_TOTAL_DOWNLOADS' )
		{
			var url = API_END_POINT+'statistics/me/totalDownloads';
			var data = {
				userId: getUserConfig().userId
			};
			sendAPIPostRequest(url, data).then(response =>
			{
				if ( response.code == 404 )
					return;

				var data = response.data;
				// Set total
				totalDownloadsStat.find('.stat-count').text('('+data.total+') as total.');
			});
		}
		else if ( statName == 'STAT_TOTAL_SHARINGS' )
		{
			var url = API_END_POINT+'statistics/me/totalSharings';
			var data = {
				userId: getUserConfig().userId
			};
			sendAPIPostRequest(url, data).then(response =>
			{
				if ( response.code == 404 )
					return;

				var data = response.data;
				// Set total
				totalSharingsStat.find('.stat-count').text('('+data.total+') sharings.');
				// Draw chart
				var dataTable = [
					['Date', 'Number of sharings']
				];
				// Loop
				$.each(data.stat, (k,v) =>
				{
					dataTable.push([v.createdDate, parseInt(v.total)]);
				});
				if ( dataTable.length < 2 )
					return;

				var options = {
					data: dataTable,
					title: 'Total sharings.',
					hAxisTitle: 'Date',
					vAxisTitle: 'Number of sharings.'
				};
				LineChart(options, chartDiv02);
			});
		}
		else
			return;
	}
}
// Setup my files
function setupMyFiles()
{
	var myFilesContainer = $('#myFilesContainer');
	if ( myFilesContainer[0] == undefined )
		return;

	var sectionBreadcrumbNav = myFilesContainer.find('#sectionBreadcrumbNav');
	var filesDiv = myFilesContainer.find('#filesDiv');
	var filesBackupDiv = myFilesContainer.find('#filesBackupDiv');
	var searchBox = TOP_NAV_CONTAINER.find('#searchBox');

	// Display search button
	TOP_NAV_CONTAINER.find('.navmenu #searchBTN').fadeIn(500);
	// Hide empty trash button
	TOP_NAV_CONTAINER.find('.navmenu #emptyTrashBTN').fadeOut(500);
	// 
	filesDiv.off('click');
	filesDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'COPY_TO_CLIPBOARD' ) // Copy link to clipboard
		{
			e.preventDefault();
			var dataText = target.data('tooltip-top');
			copyLinkToClipboard(target, target.attr('href'));
			target.data('tooltip-top', 'Copied...')
			.attr('data-tooltip-top', 'Copied...');
			setTimeout( () => 
			{
				target.data('tooltip-top', dataText)
				.attr('data-tooltip-top', dataText);
			}, 5000 );
		}
		else if ( target.data('role') == 'FILE_CHECK' ) // Toggle file checkbox
		{
			var checked = target.prop('checked');
			target.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		} 
		else if ( target.data('role') == 'FILE' ) // Toggle file checkbox
		{
			var checkbox = target.find('[data-role="FILE_CHECK"]');
			var checked = checkbox.prop('checked');
			checkbox.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		}
		else
			return;
	})
	.off('dblclick')
	.on('dblclick', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'FOLDER' ) // Navigate in forders
		{
			var dirname = target.data('foldername');
			setCurrentDir(dirname);
			getAll(dirname);
		}
	});
	// Search
	searchBox.off('keyup');
	searchBox.on('keyup', (e) =>
	{
		var target = $(e.target);
		var url = API_END_POINT+'files/search';
		var data = {
			userId: getUserConfig().userId,
			query: target.val(),
			folder: 'MY_FILES'
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#files').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				// Check file type
				var filename = formatFileWithIcon(v.filename, v.fileLink);
				html += `<div class="custom-col col-md" data-view="GRID">
								<div class="file grid-view" data-role="FILE" data-filesize="${ v.fileSize }" data-filename="${ v.filename }"  data-filelink="${ v.fileLink }" data-fullpath="${ v.fullpath }" data-filelink="${ v.fileLink }" data-fileid="${ v.fileId }" data-folder="${ v.folder }">
									<input class="form-check-input file-check" type="checkbox" value="" data-fileid="${ v.fileId }" data-role="FILE_CHECK">
									<div class="icon">
										${ filename }
									</div>
									<span class="name text-overflow">${ v.filename }</span>
									<span class="info">${ v.fileDownloads } downloads, ${ formatBytesToStr(v.fileSize) }</span>
									<div class="other-info">
										<a href="${ v.fileLink }" style="cursor: pointer;" data-role="COPY_TO_CLIPBOARD" data-tooltip-top="Copy sharing link..."><i class="fas fa-link no-pointer-events"></i></a>
										<span>${ v.fileDate } ${ v.fileTime }</span>
										<span style="cursor: pointer;" data-role="FILE_CONTEXT_MENU"><i class="fas fa-ellipsis-v"></i></span>
									</div>
								</div>
							</div>`;
			});
			// Add html
			filesDiv.find('#files').html(html);
		});
	});
	// Navigate using breadcrumb
	sectionBreadcrumbNav.off('click');
	sectionBreadcrumbNav.on('click', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		if ( target.data('role') == 'BREADCRUMB_LINK' )
		{
			target.parent().siblings().removeClass('active');
			target.parent().addClass('active');
			var dirname = target.data('currentdir');

			setCurrentDir(dirname);
			getAll(dirname);
		}
	});
	// Get all
	getAll( getCurrentDir() );
	function getAll(dir = '')
	{
		var fExplorer = new FileExplorer(dir);
		// Get folders
		// Display loader
		PageLoader();
		fExplorer.folders().then(data =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#folders').html('');
			var html = '';
			var dirList = [];
			$.each(data.folders, (k,v) =>
			{	
				var parentsPath = '';
				if ( v.parents != undefined )
				{
					dirList.push(v.parents.path);
					parentsPath = v.parents.path;
				}
				
				html += `<div class="">
							<div class="folder list-view" data-role="FOLDER" data-folder="MY_FILES" data-realname="${ v.name }" data-name="${ v.name }" data-foldername="${ parentsPath }${ v.name }/" folderpath="${ v.fullpath }">
								<span class="icon"><i class="fas fa-folder"></i></span>
								<span class="name">${ v.name }</span>
								<div class="folder-info">
									<span>${ v.filesCount } files.</span>
									<span>${ v.foldersCount } folders.</span>
								</div>
							</div>
						</div>`;
			});
			// Add html
			filesDiv.find('#folders').html(html);
			// Add folders breadcrumb
			var breadcrumbHTML = '';
			breadcrumbHTML = '<li class="breadcrumb-item active"><a href="#" class="title" data-role="BREADCRUMB_LINK" data-dirname="" data-currentdir="">My Files</a></li>';
			sectionBreadcrumbNav.find('.breadcrumb').html(breadcrumbHTML);
			if ( dir == '' || dir.length == 0 )
				return;

			var cDirList = dir.split('/').filter((val) => val != '');
			var currentDirName = cDirList[cDirList.length-1];		
			// Split dir to parent and child
			var dirBefore = '';
			for (var i = 0; i < cDirList.length; i++) 
			{
				breadcrumbHTML += '<li class="breadcrumb-item"><a href="#" class="title" data-role="BREADCRUMB_LINK" data-currentdir="'+dirBefore+cDirList[i]+'/" data-dirname="'+cDirList[i]+'">'+cDirList[i]+'</a></li>';
				dirBefore += cDirList[i]+'/';
			}
			// Set current dir name
			sectionBreadcrumbNav.find('.breadcrumb').html(breadcrumbHTML);
			// Set current folder active
			var bcListItems = sectionBreadcrumbNav.find('.breadcrumb li');
			for (var i = 0; i < bcListItems.length; i++) 
			{
				var item = $(bcListItems[i]);
				if ( item.find('a').data('dirname') == currentDirName )
				{
					item.siblings().removeClass('active');
					item.addClass('active');
				}
			}
			
		}, error =>
		{
			// Clear html
			filesDiv.find('#folders').html('');
			// Hide loader
			PageLoader(false);
		});
		// Get files
		// Display loader
		PageLoader();
		fExplorer.files().then(data =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#files').html('');
			var html = '';
			$.each(data, (k,v) =>
			{
				// Check file type
				var filename = formatFileWithIcon(v.filename, v.fileLink);
				html += `<div class="custom-col col-md" data-view="GRID">
							<div class="file grid-view" data-role="FILE" data-filesize="${ v.fileSize }" data-filename="${ v.filename }" data-fullpath="${ v.fullpath }" data-filelink="${ v.fileLink }" data-fileid="${ v.fileId }" data-folder="${ v.folder }">
								<input class="form-check-input file-check" type="checkbox" value="" data-fileid="${ v.fileId }" data-role="FILE_CHECK">
								<div class="icon">
									${ filename }
								</div>
								<span class="name text-overflow">${ v.filename }</span>
								<span class="info">${ v.fileDownloads } downloads, ${ formatBytesToStr(v.fileSize) }</span>
								<div class="other-info">
									<a href="${ v.fileLink }" style="cursor: pointer;" data-role="COPY_TO_CLIPBOARD" data-tooltip-top="Copy sharing link..."><i class="fas fa-link no-pointer-events"></i></a>
									<span>${ v.fileDate } ${ v.fileTime }</span>
									<span style="cursor: pointer;" data-role="FILE_CONTEXT_MENU"><i class="fas fa-ellipsis-v"></i></span>
								</div>
							</div>
						</div>`;
			});
			// Add html
			filesDiv.find('#files').html(html);
		}, error =>
		{
			// Clear html
			filesDiv.find('#files').html('');
			// Hide loader
			PageLoader(false);
		});
	}
}
// Setup recent files
function setupRecentFiles()
{
	var recentFilesContainer = $('#recentFilesContainer');
	if ( recentFilesContainer[0] == undefined )
		return;

	var filesDiv = recentFilesContainer.find('#filesDiv');
	var filesBackupDiv = recentFilesContainer.find('#filesBackupDiv');
	var searchBox = TOP_NAV_CONTAINER.find('#searchBox');

	// Display search button
	TOP_NAV_CONTAINER.find('.navmenu #searchBTN').fadeIn(500);
	// Hide empty trash button
	TOP_NAV_CONTAINER.find('.navmenu #emptyTrashBTN').fadeOut(500);
	// Copy link to clipboard
	filesDiv.off('click');
	filesDiv.on('click', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		if ( target.data('role') == 'COPY_TO_CLIPBOARD' )
		{
			var dataText = target.data('tooltip-top');
			copyLinkToClipboard(target, target.attr('href'));
			target.data('tooltip-top', 'Copied...')
			.attr('data-tooltip-top', 'Copied...');
			setTimeout( () => 
			{
				target.data('tooltip-top', dataText)
				.attr('data-tooltip-top', dataText);
			}, 5000 );
		}
	});
	// Search
	searchBox.off('keyup');
	searchBox.on('keyup', (e) =>
	{
		var target = $(e.target);
		var url = API_END_POINT+'files/search';
		var data = {
			userId: getUserConfig().userId,
			query: target.val(),
			folder: 'MY_FILES'
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#files').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				// Check file type
				var filename = formatFileWithIcon(v.filename, v.fileLink);
				html += `<div class="custom-col col-md-12" data-view="LIST">
								<div class="file list-view" data-role="FILE" data-filesize="${ v.fileSize }" data-filename="${ v.filename }"  data-filelink="${ v.fileLink }" data-fullpath="${ v.fullpath }" data-filelink="${ v.fileLink }" data-fileid="${ v.fileId }" data-folder="${ v.folder }">
									<input class="form-check-input file-check" type="checkbox" value="" data-fileid="${ v.fileId }" data-role="FILE_CHECK">
									<div class="icon">
										${ filename }
									</div>
									<span class="name text-overflow">${ v.filename }</span>
									<span class="info">${ v.fileDownloads } downloads, ${ formatBytesToStr(v.fileSize) }</span>
									<div class="other-info">
										<a href="${ v.fileLink }" style="cursor: pointer;" data-role="COPY_TO_CLIPBOARD" data-tooltip-top="Copy sharing link..."><i class="fas fa-link no-pointer-events"></i></a>
										<span>${ v.fileDate } ${ v.fileTime }</span>
										<span style="cursor: pointer;" data-role="FILE_CONTEXT_MENU"><i class="fas fa-ellipsis-v"></i></span>
									</div>
								</div>
							</div>`;
			});
			// Add html
			filesDiv.find('#files').html(html);
		});
	});
	// Get all
	getAll();
	function getAll()
	{
		var url = API_END_POINT+'files/recent';
		var data = {
			userId: getUserConfig().userId
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#files').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				// Check file type
				var filename = formatFileWithIcon(v.filename, v.fileLink);
				html += `<div class="custom-col col-md-12" data-view="LIST">
								<div class="file list-view" data-role="FILE" data-filesize="${ v.fileSize }" data-filename="${ v.filename }"  data-filelink="${ v.fileLink }" data-fullpath="${ v.fullpath }" data-filelink="${ v.fileLink }" data-fileid="${ v.fileId }" data-folder="${ v.folder }">
									<input class="form-check-input file-check" type="checkbox" value="" data-fileid="${ v.fileId }" data-role="FILE_CHECK">
									<div class="icon">
										${ filename }
									</div>
									<span class="name text-overflow">${ v.filename }</span>
									<span class="info">${ v.fileDownloads } downloads, ${ formatBytesToStr(v.fileSize) }</span>
									<div class="other-info">
										<a href="${ v.fileLink }" style="cursor: pointer;" data-role="COPY_TO_CLIPBOARD" data-tooltip-top="Copy sharing link..."><i class="fas fa-link no-pointer-events"></i></a>
										<span>${ v.fileDate } ${ v.fileTime }</span>
										<span style="cursor: pointer;" data-role="FILE_CONTEXT_MENU"><i class="fas fa-ellipsis-v"></i></span>
									</div>
								</div>
							</div>`;
			});
			// Add html
			filesDiv.find('#files').html(html);
		});
	}
}
// Setup Files shared with me
function setupFilesSharedWithMe()
{
	var myFilesContainer = $('#sharedFilesWithMeContainer');
	if ( myFilesContainer[0] == undefined )
		return;

	var sectionBreadcrumbNav = myFilesContainer.find('#sectionBreadcrumbNav');
	var filesDiv = myFilesContainer.find('#filesDiv');
	var filesBackupDiv = myFilesContainer.find('#filesBackupDiv');

	// Display search button
	TOP_NAV_CONTAINER.find('.navmenu #searchBTN').fadeOut(500);
	// Hide empty trash button
	TOP_NAV_CONTAINER.find('.navmenu #emptyTrashBTN').fadeOut(500);
	// 
	filesDiv.off('click');
	filesDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'COPY_TO_CLIPBOARD' ) // Copy link to clipboard
		{
			e.preventDefault();
			var dataText = target.data('tooltip-top');
			copyLinkToClipboard(target, target.attr('href'));
			target.data('tooltip-top', 'Copied...')
			.attr('data-tooltip-top', 'Copied...');
			setTimeout( () => 
			{
				target.data('tooltip-top', dataText)
				.attr('data-tooltip-top', dataText);
			}, 5000 );
		}
		else if ( target.data('role') == 'FILE_CHECK' ) // Toggle file checkbox
		{
			var checked = target.prop('checked');
			target.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		} 
		else if ( target.data('role') == 'FILE' ) // Toggle file checkbox
		{
			var checkbox = target.find('[data-role="FILE_CHECK"]');
			var checked = checkbox.prop('checked');
			checkbox.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		}
		else
			return;
	});
	// Get all
	getAll();
	function getAll()
	{
		var url = API_END_POINT+'files/sharedWithMe';
		var data = {
			userId: getUserConfig().userId
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#files').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data.files, (k,v) =>
			{
				// Check file type
				var filename = formatFileWithIcon(v.filename, v.fileLink);
				html += `<div class="custom-col col-md" data-view="GRID">
							<div class="file grid-view" data-role="FILE" data-filesize="${ v.fileSize }" data-filename="${ v.filename }"  data-filelink="${ v.fileLink }" data-permid="${ v.sharePermId }" data-ownerid="${ data.sharer.userId }" data-fileid="${ v.fileId }" data-folder="SHARED_WITH_ME">
								<input class="form-check-input file-check" type="checkbox" value="" data-fileid="${ v.fileId }" data-role="FILE_CHECK">
								<div class="icon">
									${ filename }
								</div>
								<span class="name text-overflow">${ v.filename }</span>
								<span class="info">${ v.fileDownloads } downloads, ${ formatBytesToStr(v.fileSize) }</span>
								<span class="info">Shared by: ${ data.sharer.userEmail }</span>
								<div class="other-info">
									<a href="${ v.fileLink }" style="cursor: pointer;" data-role="COPY_TO_CLIPBOARD" data-tooltip-top="Copy sharing link..."><i class="fas fa-link no-pointer-events"></i></a>
									<span>${ v.fileDate } ${ v.fileTime }</span>
									<span style="cursor: pointer;" data-role="FILE_CONTEXT_MENU"><i class="fas fa-ellipsis-v"></i></span>
								</div>
							</div>
						</div>`;
			});
			// Add html
			filesDiv.find('#files').html(html);

		});
	}
}
// Setup Files shared with me in Group
function setupFilesSharedWithMeInGroup(groupId)
{
	var myFilesContainer = $('#sharedFilesWithMeInGroupsContainer');
	if ( myFilesContainer[0] == undefined )
		return;

	var filesDiv = myFilesContainer.find('#filesDiv');
	var filesBackupDiv = myFilesContainer.find('#filesBackupDiv');

	// Display search button
	TOP_NAV_CONTAINER.find('.navmenu #searchBTN').fadeOut(500);
	// Hide empty trash button
	TOP_NAV_CONTAINER.find('.navmenu #emptyTrashBTN').fadeOut(500);
	// 
	filesDiv.off('click');
	filesDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'COPY_TO_CLIPBOARD' ) // Copy link to clipboard
		{
			e.preventDefault();
			var dataText = target.data('tooltip-top');
			copyLinkToClipboard(target, target.attr('href'));
			target.data('tooltip-top', 'Copied...')
			.attr('data-tooltip-top', 'Copied...');
			setTimeout( () => 
			{
				target.data('tooltip-top', dataText)
				.attr('data-tooltip-top', dataText);
			}, 5000 );
		}
		else if ( target.data('role') == 'FILE_CHECK' ) // Toggle file checkbox
		{
			var checked = target.prop('checked');
			target.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		} 
		else if ( target.data('role') == 'FILE' ) // Toggle file checkbox
		{
			var checkbox = target.find('[data-role="FILE_CHECK"]');
			var checked = checkbox.prop('checked');
			checkbox.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		}
		else
			return;
	});
	// Get all
	getAll();
	function getAll()
	{
		var url = API_END_POINT+'files/sharedWithMeInGroup';
		var data = {
			userId: getUserConfig().userId,
			groupId: groupId
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			console.log(response);
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#files').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			var i = 0;
			$.each(data.files, (k,v) =>
			{
				// Check file type
				var filename = formatFileWithIcon(v.filename, v.fileLink);
				html += `<div class="custom-col col-md" data-view="GRID">
							<div class="file grid-view" data-role="FILE" data-filesize="${ v.fileSize }" data-filename="${ v.filename }"  data-filelink="${ v.fileLink }" data-permid="${ v.sharePermId }" data-ownerid="${ data.sharer.userId }" data-groupid="${ data.groups[i].groupId }" data-fileid="${ v.fileId }" data-folder="SHARED_WITH_ME_IN_GROUP">
								<input class="form-check-input file-check" type="checkbox" value="" data-fileid="${ v.fileId }" data-role="FILE_CHECK">
								<div class="icon">
									${ filename }
								</div>
								<span class="name text-overflow">${ v.filename }</span>
								<span class="info">${ v.fileDownloads } downloads, ${ formatBytesToStr(v.fileSize) }</span>
								<span class="info">Shared by: ${ data.sharer.userEmail }</span>
								<span class="info">Shared in: ${ data.groups[i].groupName }</span>
								<div class="other-info">
									<a href="${ v.fileLink }" style="cursor: pointer;" data-role="COPY_TO_CLIPBOARD" data-tooltip-top="Copy sharing link..."><i class="fas fa-link no-pointer-events"></i></a>
									<span>${ v.fileDate } ${ v.fileTime }</span>
									<span style="cursor: pointer;" data-role="FILE_CONTEXT_MENU"><i class="fas fa-ellipsis-v"></i></span>
								</div>
							</div>
						</div>`;
				i++;
			});
			// Add html
			filesDiv.find('#files').html(html);

		});
	}
}
// Setup trashed files
function setupTrashedFiles()
{
	var trashedFilesContainer = $('#trashedFilesContainer');
	if ( trashedFilesContainer[0] == undefined )
		return;

	var filesDiv = trashedFilesContainer.find('#filesDiv');
	var filesBackupDiv = trashedFilesContainer.find('#filesBackupDiv');

	// Hide search button
	TOP_NAV_CONTAINER.find('.navmenu #searchBTN').fadeOut(500);
	// Display empty trash button
	TOP_NAV_CONTAINER.find('.navmenu #emptyTrashBTN').fadeIn(500);
	//
	filesDiv.off('click');
	filesDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'COPY_TO_CLIPBOARD' ) // Copy link to clipboard
		{
			e.preventDefault();
			var dataText = target.data('tooltip-top');
			copyLinkToClipboard(target, target.attr('href'));
			target.data('tooltip-top', 'Copied...')
			.attr('data-tooltip-top', 'Copied...');
			setTimeout( () => 
			{
				target.data('tooltip-top', dataText)
				.attr('data-tooltip-top', dataText);
			}, 2000 );
		}
		else if ( target.data('role') == 'FILE_CHECK' ) // Toggle file checkbox
		{
			var checked = target.prop('checked');
			target.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		} 
		else if ( target.data('role') == 'FILE' ) // Toggle file checkbox
		{
			var checkbox = target.find('[data-role="FILE_CHECK"]');
			var checked = checkbox.prop('checked');
			checkbox.attr('checked', !checked);
			SelectedFilesAndFoldersWrapper();
		}
		else
			return;
	});
	// Get all
	getAll();
	function getAll()
	{
		// Get folder
		// Display loader
		PageLoader();
		var fExplorer = new FileExplorer('');
		fExplorer.folders().then(data =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#folders').html('');
			var html = '';
			$.each(data.trashed, (k,v) =>
			{	
				var parentsPath = '';
				if ( v.parents != undefined )
				{
					parentsPath = v.parents.path;
				}
				html += `<div class="">
							<div class="folder list-view" data-role="FOLDER" data-folder="TRASH" data-realname="${ v.realname }" data-name="${ v.name }" data-foldername="${ parentsPath }${ v.name }/" folderpath="${ v.fullpath }">
								<span class="icon"><i class="fas fa-folder"></i></span>
								<span class="name">${ v.realname }</span>
								<div class="folder-info">
									<span>${ v.filesCount } files.</span>
									<span>${ v.foldersCount } folders.</span>
								</div>
							</div>
						</div>`;
			});
			// Add html
			filesDiv.find('#folders').html(html);
		}, error =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#folders').html('');
		});
		// Get files
		var url = API_END_POINT+'files/trashed';
		var data = {
			userId: getUserConfig().userId,
			folder: 'TRASH'
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			filesDiv.find('#files').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				// Check file type
				var filename = formatFileWithIcon(v.filename, v.fileLink);
				html += `<div class="custom-col col-md" data-view="GRID">
							<div class="file grid-view" data-role="FILE" data-filesize="${ v.fileSize }" data-filename="${ v.
							filename }" data-filelink="${ v.fileLink }" data-fileid="${ v.fileId }" data-folder="${ v.folder }">
								<input class="form-check-input file-check" type="checkbox" value="" data-fileid="${ v.fileId }" data-role="FILE_CHECK">
								<div class="icon">
									${ filename }
								</div>
								<span class="name text-overflow">${ v.filename }</span>
								<span class="info">${ v.fileDownloads } downloads, ${ formatBytesToStr(v.fileSize) }</span>
								<div class="other-info">
									<a href="${ v.fileLink }" style="cursor: pointer;" data-role="COPY_TO_CLIPBOARD" data-tooltip-top="Copy sharing link..."><i class="fas fa-link no-pointer-events"></i></a>
									<span>${ v.fileDate } ${ v.fileTime }</span>
									<span style="cursor: pointer;" data-role="FILE_CONTEXT_MENU"><i class="fas fa-ellipsis-v"></i></span>
								</div>
							</div>
						</div>`;
			});
			// Add html
			filesDiv.find('#files').html(html);
		});
	}
}
// Setup settings
function setupSettings()
{
	var settingsContainer = $('#settingsContainer');
	if ( settingsContainer[0] == undefined )
		return;

	var accountSettingsForm = settingsContainer.find('#accountSettingsForm');
	var asfFormContents = accountSettingsForm.find('#asfFormContents');

	var downloadsSettingsForm = settingsContainer.find('#downloadsSettingsForm');
	var dsfDownloadsPathFileInput = downloadsSettingsForm.find('#dsfDownloadsPathFileInput');
	var dsfDownloadsPathInput = downloadsSettingsForm.find('#dsfDownloadsPathInput');
	var dsfPlaySoundDownloadCompleteCheck = downloadsSettingsForm.find('#dsfPlaySoundDownloadCompleteCheck');
	var dsfDisplayDownloadCompleteDialogCheck = downloadsSettingsForm.find('#dsfDisplayDownloadCompleteDialogCheck');

	// Update user info //
	accountSettingsForm.off('submit');
	accountSettingsForm.on('submit', e =>
	{
		e.preventDefault();
		var target = accountSettingsForm;
		var fd = new FormData();

		if ( target.find('#asfImageFileInput')[0].files.length > 0 )
			fd.append('avatar', target.find('#asfImageFileInput')[0].files[0]);

		fd.append('userId', getUserConfig().userId);
		fd.append('fullname', target.find('#asfFullnameInput').val() );
		fd.append('password', target.find('#asfPasswordInput').val() );
		var url = API_END_POINT+'users/update';
		// Display loader
		PageLoader();
		sendAPIFormDataRequest(url, fd).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			DialogBox('Notice', response.message);
		});
	});
	// Update downloads settings //
	downloadsSettingsForm.off('submit');
	downloadsSettingsForm.on('submit', e =>
	{
		e.preventDefault();
		var fini = new IniFile(APP_ROOT_PATH);

		var soundDownloadComplete = ( dsfPlaySoundDownloadCompleteCheck.is(':checked') ) ? true : false;
		var displayDownloadCompleteDialog = ( dsfDisplayDownloadCompleteDialogCheck.is(':checked') ) ? true : false;
		var settings = {
			DOWNLOADS_PATH: dsfDownloadsPathInput.val(),
			SOUND_AFTER_DOWNLOAD_FINISH: soundDownloadComplete,
			DISPLAY_DOWNLOAD_COMPLETE_DIALOG: displayDownloadCompleteDialog
		};
		// Display loader
		PageLoader();
		fini.write(SETTINGS_FILE, settings, 'Download_Settings').then(created =>
		{
			// Hide loader
			PageLoader(false);
			DialogBox('Notice', 'Download settings has been updated!');
		}, error =>
		{
			// Hide loader
			PageLoader(false);
			DialogBox('Error', error);
		});
	});
	// Select downloads folder
	dsfDownloadsPathFileInput.off('click');
	dsfDownloadsPathFileInput.on('click', e =>
	{
		e.preventDefault();
		SelectDirDialog().then(arg =>
		{
			dsfDownloadsPathInput.val(arg.filePaths[0]+'/');
		});
	});
	// Get user info
	getUserInfo();
	function getUserInfo()
	{
		var url = API_END_POINT+'users/me';
		var data = {
			userId: getUserConfig().userId
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			asfFormContents.html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var userAvatar = (data.userAvatar == null || data.userAvatar == 'null' 
								|| data.userAvatar == '') ? 'src/assets/img/utils/user.png' : data.userAvatar;
			var html = `<div class="form-group mb-2">
							<img src="${userAvatar}" style="width: 100px;height: 100px; border-radius: 50%;" class="img-thumbnail" alt="">
							<input type="file" class="input-text mt-3" id="asfImageFileInput">
						</div>
						<div class="form-group mb-2">
							<label for="" class="form-label">Email:</label>
							<input type="email" class="input-text input-text-outline" id="asfEmailInput" disabled value="${data.userEmail}">
						</div>
						<div class="form-group mb-2">
							<label for="" class="form-label">Username:</label>
							<input type="text" class="input-text input-text-outline" id="asfUsernameInput" disabled value="${data.userName}">
						</div>
						<div class="form-group mb-2">
							<label for="asfFullnameInput" class="form-label">Fullname:</label>
							<input type="text" class="input-text input-text-outline" id="asfFullnameInput" required value="${ data.fullName }">
						</div>
						<div class="form-group mb-2">
							<label for="asfPasswordInput" class="form-label">Password:</label>
							<input type="password" class="input-text input-text-outline" required id="asfPasswordInput">
						</div>`;

			// Add html 
			asfFormContents.html(html);
			//

		});
	}
	// Load download settings
	loadDownloadSettings();
	function loadDownloadSettings()
	{
		loadIniSettings((data) =>
		{
			var settings = data.Download_Settings;
			dsfDownloadsPathInput.val( settings.DOWNLOADS_PATH );
			dsfPlaySoundDownloadCompleteCheck.attr('checked', settings.SOUND_AFTER_DOWNLOAD_FINISH);
			dsfDisplayDownloadCompleteDialogCheck.attr('checked', settings.DISPLAY_DOWNLOAD_COMPLETE_DIALOG);
		});
	}
}
// Setup my stuff
function setupMyStuff()
{
	var myGroupsContainer = $('#myGroupsContainer');
	if ( myGroupsContainer[0] != undefined )
	{
		// My Groups //
		var createNewGroupBTN = myGroupsContainer.find('#createNewGroupBTN');
		var groupsDiv = myGroupsContainer.find('#groupsDiv');

		//
		groupsDiv.off('click');
		groupsDiv.on('click', e =>
		{
			var target = $(e.target);
			if ( target.data('role') == 'DELETE_GROUP' )
			{
				PromptConfirmDialog('Confirm Delete', 'Are you sure?').then(confirmed =>
				{
					// Display loader
					PageLoader();
					deleteUserGroup(target.data('groupid')).then(response =>
					{
						// Hide loader
						PageLoader(false);
						if ( response.code == 404 )
						{
							DialogBox('Error', response.message);
							return;
						}

						DialogBox('Notice', response.message);
						// Get all groups
						getAllGroups();
					});
				});
			}
			else if ( target.data('role') == 'EDIT_GROUP' )
			{
				var options = {
					updateGroup: {
						groupId: target.data('groupid'),
						groupName: target.data('group_name'),
						groupDesc: target.data('group_desc')
					}
				};
				FileSharingDialog(null, 'EDIT_GROUP', options);
			}
			else
				return;
		});
		// Create group
		createNewGroupBTN.off('click');
		createNewGroupBTN.on('click', e =>
		{
			FileSharingDialog(null, 'CREATE_GROUPS');
		});
		// Get all groups
		getAllGroups();
		function getAllGroups()
		{
			// Display loader
			PageLoader();
			getUserGroups().then(response =>
			{
				// Hide loader
				PageLoader(false);
				// Clear html
				groupsDiv.html('');
				if ( response.code == 404 )
				{
					groupsDiv.html('<p class="alert alert-danger">There are no groups to display.</p>');
					return;
				}

				var data = response.data;
				var html = '<div class="row gx-3 gy-3">';
				var count = 1;
				$.each(data.groups, (k,v) =>
				{
					html += `<div class="col-lg-6 col-md-6 col-sm-12">
								<div class="list">
									<div class="rectangle"></div>
									<div class="list-contents">
										<div class="row">
											<div class="col-md-2">
												<span class="list-number">${ count.toString().padStart(2, 0) }.</span>
											</div>
											<div class="col-md">
												<div class="list-group-inline">
													<span class="list-title">${ v.groupName }</span>
													<p class="list-desc">
														${ v.groupDesc }
													</p>
													<p class="list-small-text">${ v.groupDate } ${ v.groupTime }</p>
												</div>
											</div>
										</div>
									</div>
									<div class="list-buttons flex flex-center">
										<p class="list-buttons-title">Perform necessary operation:</p>
										<div class="position-relative w-100">
											<button class="list-btn list-btn-light" data-role="EDIT_GROUP" data-groupid="${v.groupId}" data-group_name="${v.groupName}" data-group_desc="${v.groupDesc}">
												<span class="content">
													<span class="text">Edit</span>
												</span>
											</button>
											<button class="list-btn list-btn-danger" data-role="DELETE_GROUP" data-groupid="${v.groupId}">
												<span class="content">
													<span class="text">Delete</span>
												</span>
											</button>
										</div>
									</div>
								</div>
							</div>`;
					count++;
				});
				html += '</div>';
				// Add html
				groupsDiv.html(html);
			});
		}
	}
	// End //
	// Direct Sharings //
	var myDirectSharingsContainer = $('#myDirectSharingsContainer');
	if ( myDirectSharingsContainer[0] != undefined )
	{
		var paginationDiv = myDirectSharingsContainer.find('#paginationDiv');
		var unsharedFileBTN = myDirectSharingsContainer.find('#unsharedFileBTN'); 
		var sharedFilesTable = myDirectSharingsContainer.find('#sharedFilesTable'); 
		var selectAll = sharedFilesTable.find('#selectAll'); 

		// Unshare
		unsharedFileBTN.off('click');
		unsharedFileBTN.on('click', e =>
		{
			var filesList = getSelectedRowsByDataRole(sharedFilesTable, 'FILE_DIRECT_SHARING_CHECK').files;
			// Display loader
			PageLoader();
			unshareFileWithList(filesList).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				DialogBox('Notice', response.message);
				// Get all
				getDirectSharedFiles();
			});
		});
		// Select all
		selectAll.off('click');
		selectAll.on('click', e =>
		{
			var checks = sharedFilesTable.find('[data-role="FILE_DIRECT_SHARING_CHECK"]');
			checks.attr('checked', !checks.prop('checked'));
		});
		sharedFilesTable.off('click');
		sharedFilesTable.on('click', e =>
		{
			var target = $(e.target);

			if ( target.data('role') == 'TABLE_ROW' ) // Select row
			{
				var check = target.find('[data-role="FILE_DIRECT_SHARING_CHECK"]');
				check.attr('checked', !check.prop('checked'));
			}
		});
		// Get direct shared files
		getDirectSharedFiles();
		function getDirectSharedFiles()
		{
			// Display loader
			PageLoader();
			getMyDirectSharings().then(response =>
			{
				// Hide loader
				PageLoader(false);
				// Clear html
				sharedFilesTable.find('.tbody').html('');
				if ( response.code == 404 )
				{
					sharedFilesTable.find('.tbody').html('<p class="alert alert-danger">'+response.message+'</p>');
					return;
				}

				var data = response.data;
				var html = '';
				for (var i = 0; i < data.files.length; i++) 
				{
					var file = data.files[i];
					var sharedWith = data.sharedWith[i];
					html += `<div class="tr" style="cursor: pointer;" data-role="TABLE_ROW" data-fileid="${ file.fileId }" data-shared_with_id="${ sharedWith.userId }">
								<li class="td">
									<input type="checkbox" class="form-check-input" data-role="FILE_DIRECT_SHARING_CHECK"  data-fileid="${ file.fileId }" data-shared_with_id="${ sharedWith.userId }">
								</li>
								<li class="td">${ file.filename }</li>
								<li class="td">${ formatBytesToStr(file.fileSize) }</li>
								<li class="td">(${file.fileDownloads}) Times</li>
								<li class="td">${sharedWith.fullName}</li>
								<li class="td">${file.shareDate} ${file.shareTime}</li>
							</div>PAG_SEP`;
				}
				//
				var options = {
					data: html.split('PAG_SEP'),
					resultsPerPage: 15,
					linksCount: 0
				};
				// Add html
				new SmoothPagination(paginationDiv, sharedFilesTable.find('.tbody'), options);
			});
		}
	}
	// End //
	// Group Sharings //
	var myGroupSharingsContainer = $('#myGroupSharingsContainer');
	if ( myGroupSharingsContainer[0] != undefined )
	{
		var paginationDiv = myGroupSharingsContainer.find('#paginationDiv');
		var unsharedFileBTN = myGroupSharingsContainer.find('#unsharedFileBTN'); 
		var sharedFilesTable = myGroupSharingsContainer.find('#sharedFilesTable'); 
		var selectAll = sharedFilesTable.find('#selectAll'); 

		// Unshare
		unsharedFileBTN.off('click');
		unsharedFileBTN.on('click', e =>
		{
			var filesList = getSelectedRowsByDataRole(sharedFilesTable, 'FILE_GROUP_SHARING_CHECK').files;
			// Display loader
			PageLoader();
			unshareFilesWithGroup(filesList).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				DialogBox('Notice', response.message);
				// Get all
				getDirectSharedFiles();
			});
		});
		// Select all
		selectAll.off('click');
		selectAll.on('click', e =>
		{
			var checks = sharedFilesTable.find('[data-role="FILE_GROUP_SHARING_CHECK"]');
			checks.attr('checked', !checks.prop('checked'));
		});
		sharedFilesTable.off('click');
		sharedFilesTable.on('click', e =>
		{
			var target = $(e.target);

			if ( target.data('role') == 'TABLE_ROW' ) // Select row
			{
				var check = target.find('[data-role="FILE_GROUP_SHARING_CHECK"]');
				check.attr('checked', !check.prop('checked'));
			}
		});
		// Get direct shared files
		getDirectSharedFiles();
		function getDirectSharedFiles()
		{
			// Display loader
			PageLoader();
			getMyGroupsSharings().then(response =>
			{
				// Hide loader
				PageLoader(false);
				// Clear html
				sharedFilesTable.find('.tbody').html('');
				if ( response.code == 404 )
				{
					sharedFilesTable.find('.tbody').html('<p class="alert alert-danger">'+response.message+'</p>');
					return;
				}

				var data = response.data;
				var html = '';
				for (var i = 0; i < data.files.length; i++) 
				{
					var file = data.files[i];
					var sharedWith = data.sharedWith[i];
					html += `<div class="tr" style="cursor: pointer;" data-role="TABLE_ROW" data-fileid="${ file.fileId }" data-shared_with_id="${ sharedWith.userId }">
								<li class="td">
									<input type="checkbox" class="form-check-input" data-role="FILE_GROUP_SHARING_CHECK"  data-fileid="${ file.fileId }" data-shared_with_id="${ sharedWith.groupId }">
								</li>
								<li class="td">${ file.filename }</li>
								<li class="td">${ formatBytesToStr(file.fileSize) }</li>
								<li class="td">(${file.fileDownloads}) Times</li>
								<li class="td">${sharedWith.groupName}</li>
								<li class="td">${file.shareDate} ${file.shareTime}</li>
							</div>PAG_SEP`;
				}
				//
				var options = {
					data: html.split('PAG_SEP'),
					resultsPerPage: 15,
					linksCount: 0
				};
				// Add html
				new SmoothPagination(paginationDiv, sharedFilesTable.find('.tbody'), options);
			});
		}
	}
	// End //
	// Get selected rows
	function getSelectedRowsByDataRole(table, dataRole)
	{
		if ( table[0] == undefined )
			return undefined;

		var selectedList = {
			files: []
		};

		var checks = table.find('[data-role="'+dataRole+'"]');
		for (var i = 0; i < checks.length; i++) 
		{
			var check = $(checks[i]);
			if ( check.is(':checked') )
			{
				selectedList.files.push({ fileId: check.data('fileid'), sharedWith: check.data('shared_with_id') });
			}
		}

		return selectedList;
	}
}
// Setup youtube downloader
function setupYoutubeDownloader()
{
	var youtubeDownloaderContainer = $('#youtubeDownloaderContainer');
	if ( youtubeDownloaderContainer[0] == undefined )
		return;

	var TABS_LINKS = youtubeDownloaderContainer.find('#TABS_LINKS');
	var VIDEO_FORMATS_TABS_LINKS = youtubeDownloaderContainer.find('#VIDEO_FORMATS_TABS_LINKS');

	var VF_VIDEO_TAB = youtubeDownloaderContainer.find('#VF_VIDEO_TAB');
	var VF_AUDIO_TAB = youtubeDownloaderContainer.find('#VF_AUDIO_TAB');

	var SINGLE_VIDEO_TAB = youtubeDownloaderContainer.find('#SINGLE_VIDEO_TAB');
	var SINGLE_VIDEO_TAB_FORM = SINGLE_VIDEO_TAB.find('#SINGLE_VIDEO_TAB_FORM');
	var SVTF_VIDEO_URL_INPUT = SINGLE_VIDEO_TAB_FORM.find('#SVTF_VIDEO_URL_INPUT');
	var SVTF_LOADER = SINGLE_VIDEO_TAB_FORM.find('#SVTF_LOADER');

	var VIDEO_THUMNBAIL = youtubeDownloaderContainer.find('#VIDEO_THUMNBAIL');
	var VIDEO_TITLE = youtubeDownloaderContainer.find('#VIDEO_TITLE');

	var VIDEO_ID = undefined;

	// Switch download tabs
	TABS_LINKS.off('click');
	TABS_LINKS.on('click', e =>
	{
		var target = $(e.target);
		var targetTab = $(target.data('tab'));

		if ( targetTab[0] == undefined )
			return;

		targetTab.addClass('active').siblings().removeClass('active');
		target.addClass('active').siblings().removeClass('active');
	});
	// Switch video formats tabs
	VIDEO_FORMATS_TABS_LINKS.off('click');
	VIDEO_FORMATS_TABS_LINKS.on('click', e =>
	{
		var target = $(e.target);
		var targetTab = $(target.data('tab'));

		if ( targetTab[0] == undefined )
			return;

		targetTab.addClass('active').siblings().removeClass('active');
		target.addClass('active').siblings().removeClass('active');
	});
	// On video url input
	SVTF_VIDEO_URL_INPUT.off('input');
	SVTF_VIDEO_URL_INPUT.on('input', e =>
	{
		var url = SVTF_VIDEO_URL_INPUT.val();
		// Display video info
		displayVideoInfo(url);
	});
	// On form submit
	SINGLE_VIDEO_TAB_FORM.off('submit');
	SINGLE_VIDEO_TAB_FORM.on('submit', e =>
	{
		e.preventDefault();
		var url = SVTF_VIDEO_URL_INPUT.val();
		// Display video info
		displayVideoInfo(url);
	});
	// Download Video
	VF_VIDEO_TAB.off('click');
	VF_VIDEO_TAB.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'VF_VIDEO_DOWNLOAD_BTN' )
		{
			var url = target.data('url');
			var fileElement = target.closest('.tr');
			var fileSize = 0;
			// Set file size
			getFileInfoFromUrl(url).then(info =>
			{
				fileElement.data('filesize', info.total);
				// Start download
				var fileDownloader = new FileDownloader(fileElement);
				fileDownloader.download().saveFile();
				// Add request to queue
				addDownloadRequest(fileDownloader.request());
			});
		}
	});
	// Download Audio
	VF_AUDIO_TAB.off('click');
	VF_AUDIO_TAB.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'VF_AUDIO_DOWNLOAD_BTN' )
		{
			var url = target.data('url');
			console.log(url);
		}
	});
	// Display video info
	function displayVideoInfo(url)
	{
		// Check if valid youtube url
		if ( !ytdl.validateURL(url) )
		{
			DialogBox('Error', 'Not a valid youtube video url.');
			// Clear text
			SVTF_VIDEO_URL_INPUT.val('');
			return;
		}
		// Get video id
		try
		{
			var id = ytdl.getURLVideoID(url);
			setVideoId(id);
		}
		catch(error)
		{
			DialogBox('Error', error);
			return;
		}
		// Check video id
		if ( !ytdl.validateID(getVideoId()) )
		{
			DialogBox('Error', 'Not a valid youtube video url.');
			// Clear text
			SVTF_VIDEO_URL_INPUT.val('');
			return;
		}
		// Get video info
		// Display loader
		SVTF_LOADER.css('display', 'block');
		getVideoInfo().then(info =>
		{
			// Hide loader
			SVTF_LOADER.css('display', 'none');
			// Display thumbnail
			VIDEO_THUMNBAIL.attr('src', info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url );
			// Display title
			VIDEO_TITLE.text(info.videoDetails.title);
			var formats = info.formats;
			var html = '';
			// Loop Videos
			// Clear html
			VF_VIDEO_TAB.find('.tbody').html('');
			$.each(formats, (k,v) =>
			{
				if ( v.hasVideo && v.hasAudio )
				{
					var qualityLabel = '';
					var contentLength = (v.contentLength != null) ? formatBytesToStr(v.contentLength) : 'N/A';
					if ( v.qualityLabel == '720p' )
					{
						qualityLabel = `<span class="text">${v.qualityLabel} (.${v.container})</span>
										<span class="tag">${v.quality}</span>`;
					}
					else if ( v.qualityLabel == '1080p' )
					{
						qualityLabel = `<span class="text">${v.qualityLabel} (.${v.container})</span>
										<span class="tag">${v.quality}</span>`;
					}
					else
					{
						qualityLabel = `<span class="text">${v.qualityLabel} (.${v.container})</span>`;
					}
					html += `<div class="tr" data-filesize="${v.contentLength}" data-filelink="${v.url}" data-filename="${info.videoDetails.title}.${v.container}">
								<span class="icon" style="display: none;">
									<img src="${info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url}" alt="">
								</span>
								<li class="td">
									<a href="#">
										${qualityLabel}
									</a>
								</li>
								<li class="td">
									<span class="text">${ contentLength }</span>
								</li>
								<li class="td">
									<button class="btn btn-success btn-sm" data-role="VF_VIDEO_DOWNLOAD_BTN" data-url="${v.url}">
										Download
									</button>
								</li>
							</div>`;					
				}
			});
			// Add Videos html
			VF_VIDEO_TAB.find('.tbody').html(html);
			// Loop Audios
			// Clear html
			VF_AUDIO_TAB.find('.tbody').html('');
			html = '';
			$.each(formats, (k,v) =>
			{
				if ( !v.hasVideo && v.hasAudio )
				{
					var audioSampleRate = (v.audioSampleRate != null) ? '.'+v.container+' ('+formatSampleRate(v.audioSampleRate)+')' : 'N/A';
					var contentLength = (v.contentLength != null) ? formatBytesToStr(v.contentLength) : 'N/A';
					html += `<div class="tr">
								<li class="td">
									<a href="#">
										${audioSampleRate}
									</a>
								</li>
								<li class="td">
									<span class="text">${ contentLength }</span>
								</li>
								<li class="td">
									<button class="btn btn-success btn-sm" data-role="VF_AUDIO_DOWNLOAD_BTN" data-url="${v.url}">
										Download
									</button>
								</li>
							</div>`;					
				}
			});
			// Add Audios html
			VF_AUDIO_TAB.find('.tbody').html(html);
		}, error =>
		{
			// Hide loader
			SVTF_LOADER.css('display', 'none');
			// Clear html
			VF_VIDEO_TAB.find('.tbody').html('');
			VF_AUDIO_TAB.find('.tbody').html('');
		});
	}
	// Get Both formats
	async function getBothFormats()
	{
		let info = await ytdl.getInfo(getVideoId());
		let audioFormats = ytdl.filterFormats(info.formats, 'audioandvideo');
		return audioFormats;
	}
	// Get Audio formats
	async function getAudioFormats()
	{
		let info = await ytdl.getInfo(getVideoId());
		let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
		return audioFormats;
	}
	// Get Video formats
	async function getVideoFormats()
	{
		let info = await ytdl.getInfo(getVideoId());
		let audioFormats = ytdl.filterFormats(info.formats, 'videoonly');
		return audioFormats;
	}
	// Get video info
	async function getVideoInfo()
	{
		let info = await ytdl.getInfo(getVideoId());
		return info;
	}
	// Set video id
	function setVideoId(id)
	{
		VIDEO_ID = id;
	}
	// Get video Id
	function getVideoId()
	{
		return VIDEO_ID;
	}
}
// Re-assign events
rebindEvents = () =>
{
	setupNavbar();
	setupStatistics();
	setupMyFiles();
	setupRecentFiles();
	setupFilesSharedWithMe();
	setupFilesSharedWithMeInGroup();
	setupTrashedFiles();
	setupSettings();
	setupMyStuff();
	setupYoutubeDownloader();
	// Init animations
	initAnimations();
	// Get groups I'm joined
	var sideNavBarMenu = SIDE_NAV_CONTAINER.find('.middle #sideNavBarMenu');
	var userJoinedGroupsList = sideNavBarMenu.find('#userJoinedGroupsList');
	getJoinedGroups().then(response =>
	{
		// Clear html
		userJoinedGroupsList.html('');
		if ( response.code == 404 )
			return;

		var data = response.data;
		var html = '';
		$.each(data.groups, (k,v) =>
		{
			html += `<li>
						<a href="src/views/pages/shared-with-me-in-group.ejs" data-role="ACCORDION_SHARING_GROUP" data-groupid="${ v.groupId }">${ v.groupName }</a>
					</li>`;
		});
		// Add html
		userJoinedGroupsList.html(html);
	});
}
// Auto checker
function AutoChecker()
{
	var interval = setInterval( () => 
	{
		// Get notifications
		var notificationContainer = $('#notificationContainer');
		if ( notificationContainer[0] != undefined )
		{
			var notificationsWrapper = notificationContainer.find('#notificationsWrapper');
			var notificationBTN = SIDE_NAV_CONTAINER.find('.header #notificationBTN');
			var notifyRes = getUserNotifications();

			if ( notifyRes == undefined )
				return;

			notifyRes.then(response =>
			{
				// Clear html
				notificationsWrapper.html('');
				if ( response.code == 404 )
				{
					return;
				}
				var data = response.data.notifications;
				var html = '';
				// Regular notifications
				$.each(data.regular, (k,v) =>
				{
					if ( v.isRead == 0 )
					{
						CreateToast('Notification', v.desc, v.date, 7000);
						if ( !notificationBTN.hasClass('active') )
							notificationBTN.addClass('active');
					}


					html += `<div class="notification">
								<p class="notification-desc">${ v.desc }</p>
								<p class="notification-date">${ v.date }</p>
							</div>`;
				});
				// Group notifications
				$.each(data.group, (k,v) =>
				{
					if ( v.isRead == 0 )
					{
						CreateToast('Notification', v.desc, v.date, 7000);
						if ( !notificationBTN.hasClass('active') )
							notificationBTN.addClass('active');
					}


					html += `<div class="notification">
								<p class="notification-desc">${ v.desc }</p>
								<p class="notification-date">${ v.date }</p>
							</div>`;
				});
				// Add html
				notificationsWrapper.html(html);
			});
		}

	}, 20 * 1000 );
}

// Call
// Setup updates
setupAppUpdates();

// Setup default ini settings
setupDefaultIniSettings();
// Change API Settings
setupAPISettings();
// Start auto checker
AutoChecker();
// Check login
if ( !isConfigExists() )
{
	setupUserAuth();
	return;
}
// First UI user will see
getPage(APP_DIR_NAME+'src/views/pages/statistics.ejs').then(response =>
{
	MAIN_CONTENT_CONTAINER.html(response);
	// Re assign events
	rebindEvents();
});



})


