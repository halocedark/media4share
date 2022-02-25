
let SelectDirDialog;
let UploadDialog;
let CreateToast;
let DialogBox;
let SelectedFilesAndFoldersWrapper;
let DownloadDialog;
let PromptConfirmDialog;
let PromptInputDialog;
let DownloadCompleteDialog;
let MoveFileToFolderDialog;
let FolderContextMenu;
let CreateFolderDialog;
let RenameFolderDialog;
let RenameFileDialog;
let FileAdvancedLinksDialog;
let FileSharingDialog;

$(function()
{

// Folder context menu
FolderContextMenu = (folderElement = null, visible = true) =>
{
	var folderContextMenuContainer = $('#folderContextMenuContainer');
	if ( folderElement == null )
	{
		folderContextMenuContainer.removeClass('active');
		return;
	}
	var MYFILES_COMMANDS = folderContextMenuContainer.find('.MYFILES_COMMANDS');
	var TRASH_COMMANDS = folderContextMenuContainer.find('.TRASH_COMMANDS');
	var filenameHeading = folderContextMenuContainer.find('#filenameHeading');
	var restoreFolderFromTrashBTN = folderContextMenuContainer.find('[data-role="RESTORE_FOLDER_FROM_TRASH"]');
	var moveFolderToTrashBTN = folderContextMenuContainer.find('[data-role="MOVE_FOLDER_TO_TRASH"]');
	var deleteFolderForeverBTN = folderContextMenuContainer.find('[data-role="DELETE_FOLDER_FOREVER"]');
	var renameFolderBTN = folderContextMenuContainer.find('[data-role="RENAME_FOLDER"]');
	var folderName = folderElement.data('realname');
	var folderChangedName = folderElement.data('name');
	var folder = folderElement.data('folder');
	// Set folder name title
	filenameHeading.text(folderName);
	// Set folder name
	folderContextMenuContainer.data('foldername', folderName)
	.attr('data-foldername', folderName);
	// Set position
	//fileContextMenuContainer.css('top', MOUSE_Y+'px').css('left', MOUSE_X);
	if ( MOUSE_X >= window.innerWidth / 2 )
		folderContextMenuContainer.css('top', MOUSE_Y+'px').css('left', (window.innerWidth / 2)+'px' );
	else if ( MOUSE_Y >= window.innerHeight / 2 )
		folderContextMenuContainer.css('top', (window.innerHeight / 2)+'px').css('left', MOUSE_X );
	else
		folderContextMenuContainer.css('top', MOUSE_Y+'px').css('left', MOUSE_X);
	// Display menu
	if ( visible )
		folderContextMenuContainer.addClass('active');
	else
		folderContextMenuContainer.removeClass('active');

	// Hide all menu buttons when file in trash
	if ( folder == 'TRASH' )
	{
		MYFILES_COMMANDS.hide(0);
		TRASH_COMMANDS.show(0);
	}
	else if ( folder == 'MY_FILES' )
	{
		MYFILES_COMMANDS.show(0);
		TRASH_COMMANDS.hide(0);
	}
	else
		return;

	// Restore to trash
	restoreFolderFromTrashBTN.off('click');
	restoreFolderFromTrashBTN.on('click', e =>
	{
		e.preventDefault();
		var url = API_END_POINT+'folders/restoreFromTrash';
		var data = {
			userId: getUserConfig().userId,
			name: folderChangedName,
			dir: getCurrentDir()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest( url, data ).then(response =>
		{
			// Hide loader
			PageLoader(false);
			//DialogBox('Notice', response.message);
			// Rebind events
			rebindEvents();
		}, error =>
		{
			// Hide loader
			PageLoader(false);
			DialogBox('Error', error.message);
		});
	});
	// Move to trash
	moveFolderToTrashBTN.off('click');
	moveFolderToTrashBTN.on('click', e =>
	{
		e.preventDefault();
		var url = API_END_POINT+'folders/moveToTrash';
		var data = {
			userId: getUserConfig().userId,
			name: folderName,
			dir: getCurrentDir()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest( url, data ).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			//DialogBox('Notice', response.message);
			rebindEvents();
		});
	});
	// Delete forever
	deleteFolderForeverBTN.off('click');
	deleteFolderForeverBTN.on('click', e =>
	{
		e.preventDefault();
		PromptConfirmDialog('Confirm', 'Are you sure?').then(confirmed =>
		{
			var data = {
				userId: getUserConfig().userId,
				name: folderChangedName,
				dir: getCurrentDir()
			};
			// Display loader
			PageLoader();
			sendAPIPostRequest( API_END_POINT+'folders/delete', data ).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				//DialogBox('Notice', response.message);
				rebindEvents();
			});
		});
	});
	// Open Rename folder dialog
	renameFolderBTN.off('click');
	renameFolderBTN.on('click', e =>
	{
		e.preventDefault();
		RenameFolderDialog(folderName);
	});
}
// Create folder dialog
CreateFolderDialog = () =>
{
	var createFolderDialogContainer = $('#createFolderDialogContainer');
	var closeBTN = createFolderDialogContainer.find('#closeBTN');
	var folderNameInput = createFolderDialogContainer.find('#folderNameInput');
	var createBTN = createFolderDialogContainer.find('#createBTN');

	// Display dialog
	createFolderDialogContainer.addClass('active');
	// Add blur to main content container
	MAIN_CONTENT_CONTAINER.addClass('blur');
	// Close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		createFolderDialogContainer.removeClass('active');
		// Remove blur to main content container
		MAIN_CONTENT_CONTAINER.removeClass('blur');
	});
	// Create folder
	createBTN.off('click');
	createBTN.on('click', e =>
	{
		var folderName = folderNameInput.val();
		if ( folderName.length == 0 )
		{
			DialogBox('Error', 'Folder name must not be empty!');
			return;
		}
		var fExplorer = new FileExplorer(getCurrentDir()+folderName);
		fExplorer.createFolder().then(folder =>
		{
			DialogBox('Notice', 'Folder has been created!');
			// Empty input
			folderNameInput.val('');
			// Hide dialog
			createFolderDialogContainer.removeClass('active');
			// Remove blur to main content container
			MAIN_CONTENT_CONTAINER.removeClass('blur');
			// Rebind events
			rebindEvents();
		}, error =>
		{
			DialogBox('Error', error.message);
		});
	});
}
// Rename folder dialog
RenameFolderDialog = (oldname) =>
{
	var renameFolderDialogContainer = $('#renameFolderDialogContainer');
	var closeBTN = renameFolderDialogContainer.find('#closeBTN');
	var folderNameInput = renameFolderDialogContainer.find('#folderNameInput');
	var renameBTN = renameFolderDialogContainer.find('#renameBTN');

	// Display dialog
	renameFolderDialogContainer.addClass('active');
	// Add blur to main content container
	MAIN_CONTENT_CONTAINER.addClass('blur');
	// Close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		renameFolderDialogContainer.removeClass('active');
		// Remove blur to main content container
		MAIN_CONTENT_CONTAINER.removeClass('blur');
	});
	// Create folder
	renameBTN.off('click');
	renameBTN.on('click', e =>
	{
		var folderName = folderNameInput.val();
		if ( folderName.length == 0 )
		{
			DialogBox('Error', 'Folder name must not be empty!');
			return;
		}
		var fExplorer = new FileExplorer(getCurrentDir());
		fExplorer.renameFolder(oldname, folderName).then(response =>
		{
			DialogBox('Notice', response.message);
			// Empty input
			folderNameInput.val('');
			// Hide dialog
			renameFolderDialogContainer.removeClass('active');
			// Remove blur to main content container
			MAIN_CONTENT_CONTAINER.removeClass('blur');
			// Rebind events
			rebindEvents();
			// Set working dir
			//setCurrentDir('');
		}, error =>
		{
			DialogBox('Error', error.message);
		});
	});
}
// Rename file dialog
RenameFileDialog = (oldname, fileId) =>
{
	var renameFileDialogContainer = $('#renameFileDialogContainer');
	var closeBTN = renameFileDialogContainer.find('#closeBTN');
	var oldFileNameInput = renameFileDialogContainer.find('#oldFileNameInput');
	var fileNameInput = renameFileDialogContainer.find('#fileNameInput');
	var renameBTN = renameFileDialogContainer.find('#renameBTN');

	// Display dialog
	show();
	// Set old name
	oldFileNameInput.val(oldname);
	// Close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		hide();
	});
	// Create folder
	renameBTN.off('click');
	renameBTN.on('click', e =>
	{
		var fileName = fileNameInput.val();
		if ( fileName.length == 0 )
		{
			DialogBox('Error', 'File name must not be empty!');
			return;
		}

		url = API_END_POINT+'files/rename';
		var data = {
			fileId: fileId,
			filename: fileName+'.'+extractFileExtension(oldname)
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			// Clear input
			fileNameInput.val('');
			// Hide dialog
			hide();
			// Rebind events
			rebindEvents();
		});
	});

	// Display
	function show()
	{
		renameFileDialogContainer.addClass('active');
		MAIN_CONTENT_CONTAINER.addClass('blur');
	}
	// Hide
	function hide()
	{
		renameFileDialogContainer.removeClass('active');
		MAIN_CONTENT_CONTAINER.removeClass('blur');
	}
}
// File advanced links dialog
FileAdvancedLinksDialog = (fileElement) =>
{
	var fileAdvancedLinksDialogContainer = $('#fileAdvancedLinksDialogContainer');
	var closeBTN = fileAdvancedLinksDialogContainer.find('#closeBTN');
	var gadFileIcon = fileAdvancedLinksDialogContainer.find('#gadFileIcon');
	var gadFilename = fileAdvancedLinksDialogContainer.find('#gadFilename');
	var gadFileSize = fileAdvancedLinksDialogContainer.find('#gadFileSize');
	var gadFileUrlInput = fileAdvancedLinksDialogContainer.find('#gadFileUrlInput');
	var gadFileFormSnippetInput = fileAdvancedLinksDialogContainer.find('#gadFileFormSnippetInput');
	var gadFileHTMLSnippetInput = fileAdvancedLinksDialogContainer.find('#gadFileHTMLSnippetInput');

	// Display dialog
	show();
	// Setup info
	gadFileIcon.html( fileElement.find('.icon').html() );
	gadFilename.text( fileElement.data('filename') );
	gadFileSize.text( formatBytesToStr(fileElement.data('filesize')) );
	gadFileUrlInput.val( fileElement.data('filelink') );
	gadFileFormSnippetInput.val( '[url]'+fileElement.data('filelink')+'[/url]' );
	var htmlSnippet = `<a href="${fileElement.data('filelink')}" download="${fileElement.data('filename')}" target="_blank" title="Download from ${APP_NAME} for free">Download ${fileElement.data('filename')} from ${APP_NAME} for free</span></a>`;
	gadFileHTMLSnippetInput.val( htmlSnippet );
	// Close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		hide();
	});
	// Copy inputs values to clipboard
	gadFileUrlInput.siblings('.copyText').off('click');
	gadFileUrlInput.siblings('.copyText').on('click', e =>
	{
		gadFileUrlInput.focus();
		gadFileUrlInput[0].select();
		gadFileUrlInput[0].setSelectionRange(0, 99999);
		gadFileUrlInput.focus();
		navigator.clipboard.writeText( gadFileUrlInput.val() );
	});
	gadFileFormSnippetInput.siblings('.copyText').off('click');
	gadFileFormSnippetInput.siblings('.copyText').on('click', e =>
	{
		gadFileFormSnippetInput.focus();
		gadFileFormSnippetInput[0].select();
		gadFileFormSnippetInput[0].setSelectionRange(0, 99999);
		gadFileFormSnippetInput.focus();
		navigator.clipboard.writeText( gadFileFormSnippetInput.val() );
	});
	gadFileHTMLSnippetInput.siblings('.copyText').off('click');
	gadFileHTMLSnippetInput.siblings('.copyText').on('click', e =>
	{
		gadFileHTMLSnippetInput.focus();
		gadFileHTMLSnippetInput[0].select();
		gadFileHTMLSnippetInput[0].setSelectionRange(0, 99999);
		gadFileHTMLSnippetInput.focus();
		navigator.clipboard.writeText( gadFileHTMLSnippetInput.val() );
	});
	// Display
	function show()
	{
		fileAdvancedLinksDialogContainer.addClass('active');
		MAIN_CONTENT_CONTAINER.addClass('blur');
	}
	// Hide
	function hide()
	{
		fileAdvancedLinksDialogContainer.removeClass('active');
		MAIN_CONTENT_CONTAINER.removeClass('blur');
	}
}
// File sharing dialog
FileSharingDialog = (fileElement, WRAPPER = '', options = {}) =>
{
	var shareFileDialogContainer = $('#shareFileDialogContainer');
	var shareFileDialogMainWrapper = shareFileDialogContainer.find('#shareFileDialogMainWrapper');
	var backToMainSharingWindowBTN = shareFileDialogContainer.find('#backToMainSharingWindowBTN');
	var closeBTN = shareFileDialogContainer.find('#closeBTN');
	var sharingUrlWrapper = shareFileDialogContainer.find('#sharingUrlWrapper');
	var fileUrlInput = sharingUrlWrapper.find('#fileUrlInput');
	var copyFileUrlToClipboardBTN = sharingUrlWrapper.find('#copyFileUrlToClipboardBTN');
	var copyUrlSharingBTN  = sharingUrlWrapper.find('#copyUrlSharingBTN');

	var sharingFileWithPeopleWrapper = shareFileDialogContainer.find('#sharingFileWithPeopleWrapper');

	var sharingFileWithGroupsWrapper = shareFileDialogContainer.find('#sharingFileWithGroupsWrapper');

	var moreSharingSettingsWrapper = shareFileDialogContainer.find('#moreSharingSettingsWrapper');

	var peopleSearchInput = sharingFileWithPeopleWrapper.find('#peopleSearchInput');
	var peopleSearchResultsDiv = sharingFileWithPeopleWrapper.find('#peopleSearchResultsDiv');

	var shareWithSelectedPeopleBTN = sharingFileWithPeopleWrapper.find('#shareWithSelectedPeopleBTN');

	var toggleMoreSharingSettingsWrapperPeopleBTN = sharingFileWithPeopleWrapper.find('#toggleMoreSharingSettingsWrapperPeopleBTN');

	var toggleMoreSharingSettingsWrapperGroupsBTN = sharingFileWithGroupsWrapper.find('#toggleMoreSharingSettingsWrapperGroupsBTN');

	var openShareWithPeopleWindowBTN = shareFileDialogContainer.find('#openShareWithPeopleWindowBTN');

	var openShareWithGroupsWindowBTN = shareFileDialogContainer.find('#openShareWithGroupsWindowBTN');

	var groupsSearchInput = sharingFileWithGroupsWrapper.find('#groupsSearchInput');
	var groupsSearchResultsDiv = sharingFileWithGroupsWrapper.find('#groupsSearchResultsDiv');
	var openCreateGroupWrapperBTN = sharingFileWithGroupsWrapper.find('#openCreateGroupWrapperBTN');
	var shareWithSelectedGroupsBTN = sharingFileWithGroupsWrapper.find('#shareWithSelectedGroupsBTN');
	var createGroupWrapper = shareFileDialogContainer.find('#createGroupWrapper');
	var backToSharingFileWithGroupsWrapperBTN = createGroupWrapper.find('#backToSharingFileWithGroupsWrapperBTN');
	var createNewGroupForm = createGroupWrapper.find('#createNewGroupForm');
	var openAddPeopleToGroupWrapperBTN = createGroupWrapper.find('#openAddPeopleToGroupWrapperBTN');

	var permsSearchInput = moreSharingSettingsWrapper.find('#permsSearchInput');
	var permsSearchResultsDiv = moreSharingSettingsWrapper.find('#permsSearchResultsDiv');

	var addPeopleToGroupsWrapper = shareFileDialogContainer.find('#addPeopleToGroupsWrapper');
	var backCreateGroupWrapperBTN = addPeopleToGroupsWrapper.find('#backCreateGroupWrapperBTN');
	var peopleSearchForGroupInput = addPeopleToGroupsWrapper.find('#peopleSearchForGroupInput');
	var peopleSearchForGroupResultsDiv = addPeopleToGroupsWrapper.find('#peopleSearchForGroupResultsDiv');
	var addSelectedPeopleToGroupBTN = addPeopleToGroupsWrapper.find('#addSelectedPeopleToGroupBTN');
	var groupsSearchToSelectFromInput = addPeopleToGroupsWrapper.find('#groupsSearchToSelectFromInput');
	var groupsSearchResultsToSelectFromDiv = addPeopleToGroupsWrapper.find('#groupsSearchResultsToSelectFromDiv');

	var editGroupWrapper = shareFileDialogContainer.find('#editGroupWrapper');
	var editGroupForm = editGroupWrapper.find('#editGroupForm');
	var backToCreateGroupWrapperBTN = editGroupWrapper.find('#backToCreateGroupWrapperBTN');

	// Check wrapper type
	if ( WRAPPER == 'CREATE_GROUPS' )
	{
		createGroupWrapper.slideDown(0)
		.siblings('.wrapper').slideUp(0);
	}
	else if ( WRAPPER == 'EDIT_GROUP' )
	{
		editGroupWrapper.slideDown(0)
		.siblings('.wrapper').slideUp(0);
	}

	var fileUrl = (fileElement != null) ? fileElement.data('filelink') : null;
	var fileId = (fileElement != null) ? fileElement.data('fileid') : null;
	// Display dialog
	shareFileDialogContainer.addClass('active');
	// Blur main content container
	MAIN_CONTENT_CONTAINER.addClass('blur');
	// Set file url
	fileUrlInput.val(fileUrl);
	// Back to main sharing window
	backToMainSharingWindowBTN.off('click');
	backToMainSharingWindowBTN.on('click', e =>
	{
		// Hide more sharing settings
		moreSharingSettingsWrapper.slideUp(0);
		backToMainSharingWindowBTN.hide(0);
		sharingUrlWrapper.slideDown(0).siblings('.block-body').slideUp(0);
	});
	// Back to main sharing file dialog wrapper
	backToSharingFileWithGroupsWrapperBTN.off('click');
	backToSharingFileWithGroupsWrapperBTN.on('click', e =>
	{
		// Hide more sharing settings
		createGroupWrapper.slideUp(0);
		shareFileDialogMainWrapper.slideDown(0);
		sharingFileWithGroupsWrapper.slideDown(0)
		.siblings('.block-body').slideUp(0);
		backToMainSharingWindowBTN.show(0);
	});
	// Back to main sharing file dialog wrapper
	backCreateGroupWrapperBTN.off('click');
	backCreateGroupWrapperBTN.on('click', e =>
	{
		addPeopleToGroupsWrapper.slideUp(0)
		createGroupWrapper.slideDown(0);
	});
	// Back to create group dialog wrapper
	backToCreateGroupWrapperBTN.off('click');
	backToCreateGroupWrapperBTN.on('click', e =>
	{
		editGroupWrapper.slideUp(0)
		createGroupWrapper.slideDown(0);
	});
	// Display add people to groups wrapper
	openAddPeopleToGroupWrapperBTN.off('click');
	openAddPeopleToGroupWrapperBTN.on('click', e =>
	{
		// Hide create group wrapper and siblings
		addPeopleToGroupsWrapper.slideDown(0)
		.siblings('.wrapper').slideUp(0);
	});
	// Close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		shareFileDialogContainer.removeClass('active');
		// Blur main content container
		MAIN_CONTENT_CONTAINER.removeClass('blur');
	});
	// Input focus
	fileUrlInput.off('focus');
	fileUrlInput.on('focus', e =>
	{
		fileUrlInput[0].select();
		fileUrlInput[0].setSelectionRange(0, 99999);
		navigator.clipboard.writeText( fileUrlInput.val() );
	});
	// Copy to clipboard
	copyFileUrlToClipboardBTN.off('click');
	copyFileUrlToClipboardBTN.on('click', e =>
	{
		fileUrlInput.trigger('focus');
	});
	// Copy to clipboard with sharing btn
	copyUrlSharingBTN.off('click');
	copyUrlSharingBTN.on('click', e =>
	{
		fileUrlInput.trigger('focus');
	});
	// Display Share with people wrapper
	openShareWithPeopleWindowBTN.off('click');
	openShareWithPeopleWindowBTN.on('click', e =>
	{
		backToMainSharingWindowBTN.show(0);
		sharingFileWithPeopleWrapper.slideDown(0).siblings('.block-body').slideUp(0);
	});
	// Display Share with groups wrapper
	openShareWithGroupsWindowBTN.off('click');
	openShareWithGroupsWindowBTN.on('click', e =>
	{
		backToMainSharingWindowBTN.show(0);
		sharingFileWithGroupsWrapper.slideDown(0).siblings('.block-body').slideUp(0);
	});
	// Toggle more sharing settings wrapper in sharing with people
	toggleMoreSharingSettingsWrapperPeopleBTN.off('click');
	toggleMoreSharingSettingsWrapperPeopleBTN.on('click', e =>
	{
		moreSharingSettingsWrapper.slideToggle(0);
	});
	// Toggle more sharing settings wrapper in sharing with groups
	toggleMoreSharingSettingsWrapperGroupsBTN.off('click');
	toggleMoreSharingSettingsWrapperGroupsBTN.on('click', e =>
	{
		moreSharingSettingsWrapper.slideToggle(0);
	});
	// Select People
	peopleSearchResultsDiv.off('click');
	peopleSearchResultsDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'PEOPLE_SEARCH_RESULT' )
		{
			var check = target.find('[data-role="PEOPLE_SEARCH_RESULT_CHECK"]');
			check.attr('checked', !check.prop('checked') );
			// Toggle Display check
			if ( check.is(':checked') )
				check.show(0);
			else
				check.hide(0);
		}
	});
	// Share with selected people
	shareWithSelectedPeopleBTN.off('click');
	shareWithSelectedPeopleBTN.on('click', e =>
	{
		var url = API_END_POINT+'files/shareWithPeople';
		var data = {
			sharer: getUserConfig().userId,
			sharedWithList: getSelectedPeople(),
			fileId: fileId,
			sharePermId: getSelectedPerm()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				moreSharingSettingsWrapper.slideDown(200);
				permsSearchInput.trigger('focus');
				return;
			}
			DialogBox('Notice', response.message);
			// Send notification
			var peopleList = getSelectedPeople();
			asyncLoop = async () =>
			{
				for (var i = 0; i < peopleList.length; i++) 
				{
					var notifyRes = await sendNotification(peopleList[i], 'File Sharing', getUserConfig().fullName+' has shared a file with you.');

				}
			}
			asyncLoop();
		});
	});
	// Search for people
	peopleSearchInput.off('keyup');
	peopleSearchInput.on('keyup', e =>
	{
		var query = peopleSearchInput.val();
		if ( query.length == 0 )
		{
			// Clear html
			peopleSearchResultsDiv.find('.row').html('');
			return;
		}
		var url = API_END_POINT+'users/search';
		var data = {
			query: query
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			peopleSearchResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userEmail != getUserConfig().userEmail )
				{
					var userAvatar = (v.userAvatar == null || v.userAvatar == '' || v.userAvatar == 'null') ? APP_DIR_NAME+'src/assets/img/utils/user.png' : v.userAvatar;
					html += `<div class="col-lg-12 col-md-12 col-sm-12">
								<div class="search-result" data-role="PEOPLE_SEARCH_RESULT" data-userid="${ v.userId }">
									<input type="checkbox" class="form-check-input search-result-check" data-role="PEOPLE_SEARCH_RESULT_CHECK" data-userid="${ v.userId }" data-fullname="${ v.fullName }">
									<div class="row nopointer-events">
										<div class="col-md-4">
											<img src="${userAvatar}" class="user-image" alt="">
										</div>
										<div class="col-md">
											<p class="fullname">${ v.fullName }</p>
											<p class="email">${ v.userEmail }</p>
										</div>
									</div>
								</div>
							</div>`;
				}
			});
			// Add html
			peopleSearchResultsDiv.find('.row').html(html);
		});
	});
	// Search for people
	peopleSearchInput.off('focus');
	peopleSearchInput.on('focus', e =>
	{
		var url = API_END_POINT+'users/search';
		var data = {
			
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			peopleSearchResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userEmail != getUserConfig().userEmail )
				{
					var userAvatar = (v.userAvatar == null || v.userAvatar == '' || v.userAvatar == 'null') ? APP_DIR_NAME+'src/assets/img/utils/user.png' : v.userAvatar;
					html += `<div class="col-lg-12 col-md-12 col-sm-12">
								<div class="search-result" data-role="PEOPLE_SEARCH_RESULT" data-userid="${ v.userId }">
									<input type="checkbox" class="form-check-input search-result-check" data-role="PEOPLE_SEARCH_RESULT_CHECK" data-userid="${ v.userId }" data-fullname="${ v.fullName }">
									<div class="row nopointer-events">
										<div class="col-md-4">
											<img src="${userAvatar}" class="user-image" alt="">
										</div>
										<div class="col-md">
											<p class="fullname">${ v.fullName }</p>
											<p class="email">${ v.userEmail }</p>
										</div>
									</div>
								</div>
							</div>`;
				}
			});
			// Add html
			peopleSearchResultsDiv.find('.row').html(html);
		});
	});
	// Select Perm
	permsSearchResultsDiv.off('click');
	permsSearchResultsDiv.on('click', e =>
	{
		var target = $(e.target);
		var allChecks = permsSearchResultsDiv.find('[data-role="PERMS_SEARCH_RESULT_CHECK"]');
		if ( target.data('role') == 'PERMS_SEARCH_RESULT' )
		{
			var check = target.find('[data-role="PERMS_SEARCH_RESULT_CHECK"]');
			allChecks.attr('checked', false).hide(0);
			check.attr('checked', true );
			// Toggle Display check
			if ( check.is(':checked') )
				check.show(0);
			else
				check.hide(0);
		}
	});
	// Search for permissions
	permsSearchInput.off('keyup');
	permsSearchInput.on('keyup', e =>
	{
		var query = permsSearchInput.val();
		if ( query.length == 0 )
		{
			// Clear html
			permsSearchResultsDiv.find('.row').html('');
			return;
		}
		var url = API_END_POINT+'files/searchSharingPerms';
		var data = {
			query: query
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			permsSearchResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="search-result" data-role="PERMS_SEARCH_RESULT" data-permid="${ v.sharePermId }" data-permname="${ v.sharePermName }" style="padding-left: 1.8em;">
								<input type="checkbox" class="form-check-input search-result-check" data-role="PERMS_SEARCH_RESULT_CHECK" data-permid="${ v.sharePermId }" data-permname="${ v.sharePermName }">
								<p class="widget-name-ui">${ v.sharePermNameUI }</p>
								<p class="widget-desc-ui">
									${ v.sharePermDesc.substring(0, 200) }...
								</p>
							</div>
						</div>`;
			});
			// Add html
			permsSearchResultsDiv.find('.row').html(html);
		});
	});
	// Search for permissions
	permsSearchInput.off('focus');
	permsSearchInput.on('focus', e =>
	{
		var url = API_END_POINT+'files/searchSharingPerms';
		var data = {
			
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			permsSearchResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="search-result" data-role="PERMS_SEARCH_RESULT" data-permid="${ v.sharePermId }" data-permname="${ v.sharePermName }" style="padding-left: 1.8em;">
								<input type="checkbox" class="form-check-input search-result-check" data-role="PERMS_SEARCH_RESULT_CHECK" data-permid="${ v.sharePermId }" data-permname="${ v.sharePermName }">
								<p class="widget-name-ui">${ v.sharePermNameUI }</p>
								<p class="widget-desc-ui">
									${ v.sharePermDesc.substring(0, 200) }...
								</p>
							</div>
						</div>`;
			});
			// Add html
			permsSearchResultsDiv.find('.row').html(html);
		});
	});
	// Select Group
	groupsSearchResultsDiv.off('click');
	groupsSearchResultsDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'GROUP_SEARCH_RESULT' )
		{
			var check = target.find('[data-role="GROUP_SEARCH_RESULT_CHECK"]');
			check.attr('checked', !check.prop('checked') );
			// Toggle Display check
			if ( check.is(':checked') )
				check.show(0);
			else
				check.hide(0);
		}
	});
	// Share with selected groups
	shareWithSelectedGroupsBTN.off('click');
	shareWithSelectedGroupsBTN.on('click', e =>
	{
		var url = API_END_POINT+'files/shareWithGroups';
		var data = {
			sharer: getUserConfig().userId,
			sharedWithList: getSelectedGroups(),
			fileId: fileId,
			sharePermId: getSelectedPerm()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				moreSharingSettingsWrapper.slideDown(0);
				permsSearchInput.trigger('focus');
				return;
			}
			DialogBox('Notice', response.message);
			// Send notification
			var groups = getSelectedGroups();
			asyncLoop = async () =>
			{
				for (var i = 0; i < groups.length; i++) 
				{
					var notifyRes = await sendNotification(groups[i].id, 'File Sharing', getUserConfig().fullName+' has shared a file with you in '+groups[i].name);

				}
			}
			asyncLoop();
		});
	});
	// Open Create group wrapper
	openCreateGroupWrapperBTN.off('click');
	openCreateGroupWrapperBTN.on('click', e =>
	{
		createGroupWrapper.slideDown(0)
		.siblings('.wrapper').slideUp(0);
	});
	// Search for groups
	groupsSearchInput.off('keyup');
	groupsSearchInput.on('keyup', e =>
	{
		var query = groupsSearchInput.val();
		if ( query.length == 0 )
		{
			// Clear html
			groupsSearchResultsDiv.find('.row').html('');
			return;
		}
		var url = API_END_POINT+'groups/search';
		var data = {
			ownerId: getUserConfig().userId,
			query: query
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			groupsSearchResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="search-result" data-role="GROUP_SEARCH_RESULT" data-groupid="${ v.groupId }" style="padding-left: 1.8em;">
								<input type="checkbox" class="form-check-input search-result-check" data-role="GROUP_SEARCH_RESULT_CHECK" data-groupid="${ v.groupId }" data-groupname="${ v.groupName }">
								<p class="widget-name-ui">${ v.groupName }</p>
								<p class="widget-desc-ui">
									${ v.groupDesc.substring(0, 200) }...
								</p>
							</div>
						</div>`;
			});
			// Add html
			groupsSearchResultsDiv.find('.row').html(html);
		});
	});
	// Search for groups
	groupsSearchInput.off('focus');
	groupsSearchInput.on('focus', e =>
	{
		var url = API_END_POINT+'groups/search';
		var data = {
			ownerId: getUserConfig().userId
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			groupsSearchResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="search-result" data-role="GROUP_SEARCH_RESULT" data-groupid="${ v.groupId }" style="padding-left: 1.8em;">
								<input type="checkbox" class="form-check-input search-result-check" data-role="GROUP_SEARCH_RESULT_CHECK" data-groupid="${ v.groupId }" data-groupname="${ v.groupName }">
								<p class="widget-name-ui">${ v.groupName }</p>
								<p class="widget-desc-ui">
									${ v.groupDesc.substring(0, 200) }...
								</p>
							</div>
						</div>`;
			});
			// Add html
			groupsSearchResultsDiv.find('.row').html(html);
		});
	});
	// Create new group
	createNewGroupForm.off('submit');
	createNewGroupForm.on('submit', e =>
	{
		e.preventDefault();
		var target = createNewGroupForm;
		var url = API_END_POINT+'groups/create';
		var data = {
			ownerId: getUserConfig().userId,
			name: target.find('#cngfGroupNameInput').val(),
			desc: target.find('#cngfGroupDescInput').val()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			DialogBox('Notice', response.message);
			// Reset
			target[0].reset();
			// Rebind events
			rebindEvents();
		});
	});
	// Select People to add to group
	peopleSearchForGroupResultsDiv.off('click');
	peopleSearchForGroupResultsDiv.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'PEOPLE_FOR_GROUP_SEARCH_RESULT' )
		{
			var check = target.find('[data-role="PEOPLE_SEARCH_FOR_GROUP_RESULT_CHECK"]');
			check.attr('checked', !check.prop('checked') );
			// Toggle Display check
			if ( check.is(':checked') )
				check.show(0);
			else
				check.hide(0);
		}
	});
	// Select Group to add people to
	groupsSearchResultsToSelectFromDiv.off('click');
	groupsSearchResultsToSelectFromDiv.on('click', e =>
	{
		var target = $(e.target);
		var allChecks = groupsSearchResultsToSelectFromDiv.find('[data-role="ADDED_GROUP_SEARCH_RESULT_CHECK"]');
		if ( target.data('role') == 'ADDED_GROUP_SEARCH_RESULT' )
		{
			var check = target.find('[data-role="ADDED_GROUP_SEARCH_RESULT_CHECK"]');
			allChecks.attr('checked', false).hide(0);
			check.attr('checked', true );
			// Toggle Display check
			if ( check.is(':checked') )
				check.show(0);
			else
				check.hide(0);
		}
	});
	// Add selected people to group
	addSelectedPeopleToGroupBTN.off('click');
	addSelectedPeopleToGroupBTN.on('click', e =>
	{
		var url = API_END_POINT+'groups/addUsers';
		var data = {
			usersList: getSelectedPeopleToAddToGroup(),
			groupId: getSelectedGroup()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
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
	// Search for people to to groups
	peopleSearchForGroupInput.off('keyup');
	peopleSearchForGroupInput.on('keyup', e =>
	{
		var query = peopleSearchForGroupInput.val();
		if ( query.length == 0 )
		{
			// Clear html
			peopleSearchForGroupResultsDiv.find('.row').html('');
			return;
		}
		var url = API_END_POINT+'users/search';
		var data = {
			query: query
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			peopleSearchForGroupResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userEmail != getUserConfig().userEmail )
				{
					var userAvatar = (v.userAvatar == null || v.userAvatar == '' || v.userAvatar == 'null') ? APP_DIR_NAME+'src/assets/img/utils/user.png' : v.userAvatar;
					html += `<div class="col-lg-12 col-md-12 col-sm-12">
								<div class="search-result" data-role="PEOPLE_FOR_GROUP_SEARCH_RESULT" data-userid="${ v.userId }">
									<input type="checkbox" class="form-check-input search-result-check" data-role="PEOPLE_SEARCH_FOR_GROUP_RESULT_CHECK" data-userid="${ v.userId }">
									<div class="row nopointer-events">
										<div class="col-md-4">
											<img src="${userAvatar}" class="user-image" alt="">
										</div>
										<div class="col-md">
											<p class="fullname">${ v.fullName }</p>
											<p class="email">${ v.userEmail }</p>
										</div>
									</div>
								</div>
							</div>`;
				}
			});
			// Add html
			peopleSearchForGroupResultsDiv.find('.row').html(html);
		});
	});
	// Search for people to to groups
	peopleSearchForGroupInput.off('focus');
	peopleSearchForGroupInput.on('focus', e =>
	{
		var url = API_END_POINT+'users/search';
		var data = {
			
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			peopleSearchForGroupResultsDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userEmail != getUserConfig().userEmail )
				{
					var userAvatar = (v.userAvatar == null || v.userAvatar == '' || v.userAvatar == 'null') ? APP_DIR_NAME+'src/assets/img/utils/user.png' : v.userAvatar;
					html += `<div class="col-lg-12 col-md-12 col-sm-12">
								<div class="search-result" data-role="PEOPLE_FOR_GROUP_SEARCH_RESULT" data-userid="${ v.userId }">
									<input type="checkbox" class="form-check-input search-result-check" data-role="PEOPLE_SEARCH_FOR_GROUP_RESULT_CHECK" data-userid="${ v.userId }">
									<div class="row nopointer-events">
										<div class="col-md-4">
											<img src="${userAvatar}" class="user-image" alt="">
										</div>
										<div class="col-md">
											<p class="fullname">${ v.fullName }</p>
											<p class="email">${ v.userEmail }</p>
										</div>
									</div>
								</div>
							</div>`;
				}
			});
			// Add html
			peopleSearchForGroupResultsDiv.find('.row').html(html);
		});
	});
	// Search for people to to groups
	groupsSearchToSelectFromInput.off('keyup');
	groupsSearchToSelectFromInput.on('keyup', e =>
	{
		var query = groupsSearchToSelectFromInput.val();
		if ( query.length == 0 )
		{
			// Clear html
			groupsSearchResultsToSelectFromDiv.find('.row').html('');
			return;
		}
		var url = API_END_POINT+'groups/search';
		var data = {
			ownerId: getUserConfig().userId,
			query: query
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			groupsSearchResultsToSelectFromDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="search-result" data-role="ADDED_GROUP_SEARCH_RESULT" data-groupid="${ v.groupId }" style="padding-left: 1.8em;">
								<input type="checkbox" class="form-check-input search-result-check" data-role="ADDED_GROUP_SEARCH_RESULT_CHECK" data-groupid="${ v.groupId }">
								<p class="widget-name-ui">${ v.groupName }</p>
								<p class="widget-desc-ui">
									${ v.groupDesc.substring(0, 200) }...
								</p>
							</div>
						</div>`;
			});
			// Add html
			groupsSearchResultsToSelectFromDiv.find('.row').html(html);
		});
	});
	// Search for people to to groups
	groupsSearchToSelectFromInput.off('focus');
	groupsSearchToSelectFromInput.on('focus', e =>
	{
		var url = API_END_POINT+'groups/search';
		var data = {
			ownerId: getUserConfig().userId
		};
		sendAPIPostRequest(url, data).then(response =>
		{
			// Clear html
			groupsSearchResultsToSelectFromDiv.find('.row').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<div class="col-lg-12 col-md-12 col-sm-12">
							<div class="search-result" data-role="ADDED_GROUP_SEARCH_RESULT" data-groupid="${ v.groupId }" style="padding-left: 1.8em;">
								<input type="checkbox" class="form-check-input search-result-check" data-role="ADDED_GROUP_SEARCH_RESULT_CHECK" data-groupid="${ v.groupId }">
								<p class="widget-name-ui">${ v.groupName }</p>
								<p class="widget-desc-ui">
									${ v.groupDesc.substring(0, 200) }...
								</p>
							</div>
						</div>`;
			});
			// Add html
			groupsSearchResultsToSelectFromDiv.find('.row').html(html);
		});
	});
	// Update group
	// Set input
	if ( options.updateGroup != undefined )
	{
		editGroupForm.find('#egfGroupNameInput').val( options.updateGroup.groupName );
		editGroupForm.find('#egfGroupDescInput').val( options.updateGroup.groupDesc );
	}
	editGroupForm.off('submit');
	editGroupForm.on('submit', e =>
	{
		e.preventDefault();
		var target = editGroupForm;

		var url = API_END_POINT+'groups/update';
		var data = {
			ownerId: getUserConfig().userId,
			groupId: options.updateGroup.groupId,
			name: target.find('#egfGroupNameInput').val(),
			desc: target.find('#egfGroupDescInput').val()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			DialogBox('Notice', response.message);
			// Rebind events
			rebindEvents();
		});
	});
	// Get selected people
	function getSelectedPeople()
	{
		var checksList = peopleSearchResultsDiv.find('[data-role="PEOPLE_SEARCH_RESULT_CHECK"]');
		var checkedList = [];
		for (var i = 0; i < checksList.length; i++) 
		{
			var check = $(checksList[i]);
			if ( check.is(':checked') )
				checkedList.push(check.data('userid') );
		}

		return checkedList;
	}
	// Get selected perm
	function getSelectedPerm()
	{
		var checksList = permsSearchResultsDiv.find('[data-role="PERMS_SEARCH_RESULT_CHECK"]');
		var selected = undefined;
		for (var i = 0; i < checksList.length; i++) 
		{
			var check = $(checksList[i]);
			if ( check.is(':checked') )
			{
				selected = check.data('permid');
				break;
			}
		}

		return selected;
	}
	// Get selected people to add to group
	function getSelectedPeopleToAddToGroup()
	{
		var checksList = peopleSearchForGroupResultsDiv.find('[data-role="PEOPLE_SEARCH_FOR_GROUP_RESULT_CHECK"]');
		var checkedList = [];
		for (var i = 0; i < checksList.length; i++) 
		{
			var check = $(checksList[i]);
			if ( check.is(':checked') )
				checkedList.push(check.data('userid') );
		}

		return checkedList;
	}
	// Get selected group To addPeople to
	function getSelectedGroup()
	{
		var checksList = groupsSearchResultsToSelectFromDiv.find('[data-role="ADDED_GROUP_SEARCH_RESULT_CHECK"]');
		var selected = undefined;
		for (var i = 0; i < checksList.length; i++) 
		{
			var check = $(checksList[i]);
			if ( check.is(':checked') )
			{
				selected = check.data('groupid');
				break;
			}
		}

		return selected;
	}
	// Get selected groups
	function getSelectedGroups()
	{
		var checksList = groupsSearchResultsDiv.find('[data-role="GROUP_SEARCH_RESULT_CHECK"]');
		var checkedList = [];
		for (var i = 0; i < checksList.length; i++) 
		{
			var check = $(checksList[i]);
			if ( check.is(':checked') )
				checkedList.push({id: check.data('groupid'), name: check.data('groupname')});
		}

		return checkedList;
	}	
}
// Move file to folder dialog
MoveFileToFolderDialog = (fileId) =>
{
	var moveFileToFolderDialogContainer = $('#moveFileToFolderDialogContainer');
	var closeBTN = moveFileToFolderDialogContainer.find('#closeBTN');
	var folderSelect = moveFileToFolderDialogContainer.find('#folderSelect');
	var moveFileBTN = moveFileToFolderDialogContainer.find('#moveFileBTN');

	// Display
	show();
	// Close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		// Hide
		hide();
	});
	// List folders in current dir
	var fExplorer = new FileExplorer( getCurrentDir() );
	fExplorer.folders().then(response =>
	{
		var html = '';
		$.each(response.folders, (k,v) =>
		{
			html += `<option value="${ v.fullpath }">${ v.name }</option>`;
		});
		// Add html
		folderSelect.html(html);
	});
	moveFileBTN.off('click');
	moveFileBTN.on('click', e =>
	{
		var url = API_END_POINT+'files/moveToFolder';
		var data = {
			userId: getUserConfig().userId,
			fileId: fileId,
			folderName: folderSelect.find(':selected').text(),
			folderPath: folderSelect.find(':selected').val()
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			// Hide
			hide();
			// Refresh
			rebindEvents();
		});
	});

	function show()
	{
		// Display dialog
		moveFileToFolderDialogContainer.addClass('active');
		// blur
		MAIN_CONTENT_CONTAINER.addClass('blur');
	}

	function hide()
	{
		// Display dialog
		moveFileToFolderDialogContainer.removeClass('active');
		// blur
		MAIN_CONTENT_CONTAINER.removeClass('blur');
	}
}
// File context menu
FileContextMenu = (fileElement = null, visible = true) =>
{
	var fileContextMenuContainer = $('#fileContextMenuContainer');
	if ( fileElement == null )
	{
		fileContextMenuContainer.removeClass('active');
		return;
	}
	var moveFileToTrashBTN = fileContextMenuContainer.find('[data-role="MOVE_FILE_TO_TRASH"]');
	var MYFILES_COMMANDS = fileContextMenuContainer.find('.MYFILES_COMMANDS');
	var TRASH_COMMANDS = fileContextMenuContainer.find('.TRASH_COMMANDS');
	var DOWNLOADING_COMMANDS = fileContextMenuContainer.find('.DOWNLOADING_COMMANDS');
	var restoreFileFromTrashBTN = fileContextMenuContainer.find('[data-role="RESTORE_FILE_FROM_TRASH"]');
	var deleteFileForeverBTN = fileContextMenuContainer.find('[data-role="DELETE_FILE_FOREVER"]');
	var downloadFileBTN = fileContextMenuContainer.find('[data-role="DOWNLOAD_FILE"]');
	var shareFileBTN = fileContextMenuContainer.find('[data-role="SHARE_FILE"]');
	var unshareFileBTN = fileContextMenuContainer.find('[data-role="UNSHARE_FILE"]');
	var moveFileToFolderBTN = fileContextMenuContainer.find('[data-role="MOVE_FILE_TO_FOLDER"]');
	var saveFileAsBTN = fileContextMenuContainer.find('[data-role="SAVE_FILE_AS"]');
	var renameFileBTN = fileContextMenuContainer.find('[data-role="RENAME_FILE"]');
	var quickLinkBTN = fileContextMenuContainer.find('[data-role="COPY_FILE_LINK_TO_CLIPBOARD"]');
	var advancedLinksBTN = fileContextMenuContainer.find('[data-role="FILE_ADVANCED_LINKS"]');

	var fileId = fileElement.data('fileid');
	var filename = fileElement.data('filename');
	var fileLink = fileElement.data('filelink');
	var folder = fileElement.data('folder');
	var permId = fileElement.data('permid');
	var groupId = (fileElement.data('groupid') != null) ? fileElement.data('groupid') : '';
	// Set file id
	fileContextMenuContainer.data('fileid', fileId)
	.attr('data-fileid', fileId);
	// Set position
	//fileContextMenuContainer.css('top', MOUSE_Y+'px').css('left', MOUSE_X);
	if ( MOUSE_X >= window.innerWidth / 2 )
		fileContextMenuContainer.css('top', MOUSE_Y+'px').css('left', (window.innerWidth / 2)+'px' );
	else if ( MOUSE_Y >= window.innerHeight / 2 )
		fileContextMenuContainer.css('top', (window.innerHeight / 2)+'px').css('left', MOUSE_X );
	else
		fileContextMenuContainer.css('top', MOUSE_Y+'px').css('left', MOUSE_X);
	// Display menu
	if ( visible )
		fileContextMenuContainer.addClass('active');
	else
		fileContextMenuContainer.removeClass('active');

	fileContextMenuContainer.find('a').show(0);
	// Hide special occasion buttons
	unshareFileBTN.hide(0);
	// Hide all menu buttons when file in trash
	MYFILES_COMMANDS.show(0);
	if ( folder == 'TRASH' )
	{
		MYFILES_COMMANDS.hide(0);
		TRASH_COMMANDS.show(0);
		DOWNLOADING_COMMANDS.hide(0);
	}
	else if ( folder == 'MY_FILES' )
	{
		MYFILES_COMMANDS.show(0);
		TRASH_COMMANDS.hide(0);
		DOWNLOADING_COMMANDS.hide(0);
	}
	else if ( folder == 'RECENT_FILES' )
	{
		fileContextMenuContainer.removeClass('active');
		DOWNLOADING_COMMANDS.hide(0);
	}
	else if ( folder == 'SHARED_WITH_ME' )
	{
		fileContextMenuContainer.find('a').hide(0);
		// Display download button
		downloadFileBTN.show(0);
		// Display unshare
		unshareFileBTN.show(0);
		DOWNLOADING_COMMANDS.hide(0);
	}
	else if ( folder == 'SHARED_WITH_ME_IN_GROUP' )
	{
		fileContextMenuContainer.find('a').hide(0);
		// Display download button
		downloadFileBTN.show(0);
		DOWNLOADING_COMMANDS.hide(0);
	}
	else if ( folder == 'DOWNLOADING' )
	{
		// Display save as button
		DOWNLOADING_COMMANDS.show(0)
		.siblings().hide(0);
	}
	else
		return;

	// Move file to trash
	moveFileToTrashBTN.off('click');
	moveFileToTrashBTN.on('click', e =>
	{
		e.preventDefault();
		var url = API_END_POINT+'files/moveToTrash';
		var data = {
			fileId: fileId
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			//DialogBox('Notice', response.message);
			// Rebind events
			rebindEvents();
		});
	});
	// Restore file from trash
	restoreFileFromTrashBTN.off('click');
	restoreFileFromTrashBTN.on('click', e =>
	{
		e.preventDefault();
		var url = API_END_POINT+'files/restoreFromTrash';
		var data = {
			fileId: fileId
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			//DialogBox('Notice', response.message);
			// Rebind events
			rebindEvents();
		});
	});
	// Delete forever
	deleteFileForeverBTN.off('click');
	deleteFileForeverBTN.on('click', e =>
	{
		e.preventDefault();
		PromptConfirmDialog('Confirm', 'Are you sure?').then(confirmed =>
		{
			var url = API_END_POINT+'files/delete';
			var data = {
				fileId: fileId
			};
			// Display loader
			PageLoader();
			sendAPIPostRequest(url, data).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				//DialogBox('Notice', response.message);
				// Rebind events
				rebindEvents();
			});
		});
	});
	// Share file
	shareFileBTN.off('click');
	shareFileBTN.on('click', e =>
	{
		e.preventDefault();
		FileSharingDialog(fileElement);
	});
	// Unshare file
	unshareFileBTN.off('click');
	unshareFileBTN.on('click', e =>
	{
		e.preventDefault();
		PromptConfirmDialog('Confirm', 'Are you sure?').then(confirmed =>
		{
			var url = API_END_POINT+'files/unshareWithMe';
			var data = {
				userId: getUserConfig().userId,
				fileId: fileId
			};
			// Display loader
			PageLoader();
			sendAPIPostRequest(url, data).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				//DialogBox('Notice', response.message);
				// Rebind events
				rebindEvents();
			});
		});
	});
	// Move file to folder
	moveFileToFolderBTN.off('click');
	moveFileToFolderBTN.on('click', e =>
	{
		e.preventDefault();
		MoveFileToFolderDialog(fileId);
	});
	// Download file
	downloadFileBTN.off('click');
	downloadFileBTN.on('click', e =>
	{
		if ( folder == 'SHARED_WITH_ME' )
		{
			getSharingPerm(permId, (response) =>
			{
				if (response.code == 404)
				{
					DialogBox('Error', response.message);
					return;
				}
				var perm = response.data;
				if ( perm.sharePermName != 'SHARE_PERM_DOWNLOAD' )
				{
					DialogBox('Error', 'You don\'t have permission to complete this action!');
					return;
				}
				var fileDownloader = new FileDownloader(fileElement);
				fileDownloader.download().saveFile();

				// Add request to queue
				addDownloadRequest(fileDownloader.request());
			});
			return;
		}
		else if ( folder == 'SHARED_WITH_ME_IN_GROUP' )
		{
			getSharingPerm(permId, (response) =>
			{
				if (response.code == 404)
				{
					DialogBox('Error', response.message);
					return;
				}
				var perm = response.data;
				if ( perm.sharePermName != 'SHARE_PERM_DOWNLOAD' )
				{
					DialogBox('Error', 'You don\'t have permission to complete this action!');
					return;
				}
				var fileDownloader = new FileDownloader(fileElement);
				fileDownloader.download().saveFile();

				// Add request to queue
				addDownloadRequest(fileDownloader.request());
			});
			return;
		}
		var fileDownloader = new FileDownloader(fileElement);
		fileDownloader.download().saveFile();

		// Add request to queue
		addDownloadRequest(fileDownloader.request());
	});
	// Rename file
	renameFileBTN.off('click');
	renameFileBTN.on('click', e =>
	{
		RenameFileDialog(filename, fileId);
	});
	// Quick link
	quickLinkBTN.off('click');
	quickLinkBTN.on('click', e =>
	{
		e.preventDefault();
		// Set link
		quickLinkBTN.attr('href', fileLink);
		copyLinkToClipboard(quickLinkBTN, quickLinkBTN.attr('href'));
		CreateToast('Notification', 'File link copied....', '', 5000);
	});
	// Advanced links
	advancedLinksBTN.off('click');
	advancedLinksBTN.on('click', e =>
	{
		FileAdvancedLinksDialog(fileElement);
	});
}
// Download complete dialog
DownloadCompleteDialog = (fileObject = {fullpath: '', name: ''}) =>
{
	var downloadCompleteContainer = $('#downloadCompleteContainer');
	var closeBTN = downloadCompleteContainer.find('#closeBTN');
	var filePathSpan = downloadCompleteContainer.find('#filePathSpan');
	var fileNameSpan = downloadCompleteContainer.find('#fileNameSpan');
	var closeBTN2 = downloadCompleteContainer.find('#closeBTN2');
	var openFolderBTN = downloadCompleteContainer.find('#openFolderBTN');
	var openFileBTN = downloadCompleteContainer.find('#openFileBTN');

	// Display dialog
	show();
	// Set file path
	filePathSpan.text( fileObject.fullpath.substr(0, 50)+'...' );
	// Set file name
	fileNameSpan.text( fileObject.name.substr(0, 50)+'...' );
	// Close
	closeBTN.off('click');
	closeBTN.on('click', e =>
	{
		e.preventDefault();
		hide();
	});
	closeBTN2.off('click');
	closeBTN2.on('click', e =>
	{
		e.preventDefault();
		hide();
	});
	// Open folder
	openFolderBTN.off('click');
	openFolderBTN.on('click', e =>
	{
		e.preventDefault();
		openFolder( path.dirname(fileObject.fullpath) );
	});
	// Open File
	openFileBTN.off('click');
	openFileBTN.on('click', e =>
	{
		e.preventDefault();
		openFile(fileObject.fullpath);
	});

	// Display
	function show()
	{
		downloadCompleteContainer.addClass('active');
		MAIN_CONTENT_CONTAINER.addClass('blur');
	}
	// Hide
	function hide()
	{
		downloadCompleteContainer.removeClass('active');
		MAIN_CONTENT_CONTAINER.removeClass('blur');
	}
}
// Prompt Input dialog
PromptInputDialog = (title, placeholder = 'Enter text here...') =>
{
	var promptDialogContainer = $('#promptInputDialog');
	var promptDialogTitle = promptDialogContainer.find('.block-title');
	var promptDialogCloseBTN = promptDialogContainer.find('#closeBTN');
	var promptDialogTextInput = promptDialogContainer.find('#promptDialogTextInput');
	var promptDialogOK = promptDialogContainer.find('#okBTN');
	var promptDialogCancel = promptDialogContainer.find('#cancelBTN');

	var promise = new Promise((resolve, reject) =>
	{
		// Display dialog
		show();
		// Set title
		promptDialogTitle.text(title);
		// Set input placeholder
		promptDialogTextInput.attr('placeholder', placeholder);
		//CLose dialog
		promptDialogCloseBTN.off('click');
		promptDialogCloseBTN.on('click', e =>
		{
			e.preventDefault();
			close();
		});

		// Click OK
		promptDialogOK.off('click');
		promptDialogOK.on('click', () =>
		{
			// Close dialog
			close();
			resolve(promptDialogTextInput.val());
		});	
		// Click CANCEL
		promptDialogCancel.off('click');
		promptDialogCancel.on('click', () =>
		{
			// Close dialog
			close();
			reject(null);
		});
	});

	// Display dialog
	function show()
	{
		promptDialogContainer.addClass('active');
	}
	// Close dialog
	function close()
	{
		promptDialogContainer.removeClass('active');
	}

	return promise;
}
// Prompt confirm dialog
PromptConfirmDialog = (title, html) =>
{
	var promptDialogContainer = $('#promptConfirmDialog');
	var promptDialogTitle = promptDialogContainer.find('.block-title');
	var promptDialogCloseBTN = promptDialogContainer.find('#closeBTN');
	var promptDialogBody = promptDialogContainer.find('.block-body');
	var promptDialogOK = promptDialogContainer.find('#okBTN');
	var promptDialogCancel = promptDialogContainer.find('#cancelBTN');

	var promise = new Promise((resolve, reject) =>
	{
		// Display dialog
		show();
		// Set title
		promptDialogTitle.text(title);
		// Set body html
		promptDialogBody.html(html);
		//CLose dialog
		promptDialogCloseBTN.off('click');
		promptDialogCloseBTN.on('click', e =>
		{
			e.preventDefault();
			close();
		});

		// Click OK
		promptDialogOK.off('click');
		promptDialogOK.on('click', () =>
		{
			// Close dialog
			close();
			resolve(true);
		});	
		// Click CANCEL
		promptDialogCancel.off('click');
		promptDialogCancel.on('click', () =>
		{
			// Close dialog
			close();
			reject(false);
		});
	});

	// Display dialog
	function show()
	{
		promptDialogContainer.addClass('active');
	}
	// Close dialog
	function close()
	{
		promptDialogContainer.removeClass('active');
	}

	return promise;
}
// Download Dialog
DownloadDialog = (filesHTMList = [], displayType = 'DLG_MINIMIZED') =>
{
	var downloadModalContainer = $('#downloadModalContainer');
	var minimizeDialogBTN = downloadModalContainer.find('#minimizeDialogBTN');
	var closeDialogBTN = downloadModalContainer.find('#closeDialogBTN');
	var cancelAllBTN = downloadModalContainer.find('#cancelAllBTN');
	var selectedFilesDiv = downloadModalContainer.find('#selectedFilesDiv');

	var minimizedDownloadModal = $('#minimizedDownloadModal');
	var maximizeDialogBTN = minimizedDownloadModal.find('#maximizeDialogBTN');

	// Display dialog minimized
	if ( displayType == 'DLG_MINIMIZED' )
		minimize();
	else if ( displayType == 'DLG_MAXIMIZED' )
		maximize();
	else
		'';
	// Add files
	addFiles(filesHTMList);
	// Close
	closeDialogBTN.off('click');
	closeDialogBTN.on('click', e =>
	{
		if ( getFilesListCount() > 0 )
		{
			PromptConfirmDialog('Confirm Closing Downloader', 'Are you sure?').then(confirmed =>
			{
				// Clear requests
				clearDownloadRequests();
				// Hide download
				hide();
				// Clear
				clearAll();
			});
		}
		else
		{
			// Hide downloader
			hide();
		}
	});
	// Cancel all
	cancelAllBTN.off('click');
	cancelAllBTN.on('click', e =>
	{
		if ( getFilesListCount() > 0 )
		{
			PromptConfirmDialog('Confirm Canceling Downloads', 'Are you sure?').then(confirmed =>
			{
				// Clear requests
				clearDownloadRequests();
				// Hide download
				hide();
				// Clear
				clearAll();
			});
		}
		else
		{
			// Hide downloader
			hide();
		}
	});
	// Minimize dialog
	minimizeDialogBTN.off('click');
	minimizeDialogBTN.on('click', e =>
	{
		minimize();
	});
	// Maximize dialog
	maximizeDialogBTN.off('click');
	maximizeDialogBTN.on('click', e =>
	{
		maximize();
	});
	// Display
	function show()
	{
		downloadModalContainer.addClass('active');
	}
	// Hide
	function hide()
	{
		downloadModalContainer.removeClass('active');
		minimizedDownloadModal.removeClass('active');
	}
	// Minimize dialog
	function minimize()
	{
		downloadModalContainer.removeClass('active');
		minimizedDownloadModal.addClass('active');
	}
	// Maximize dialog
	function maximize()
	{
		downloadModalContainer.addClass('active');
		minimizedDownloadModal.removeClass('active');
	}
	// Add file to dialog
	function addFiles()
	{
		for (var i = 0; i < filesHTMList.length; i++) 
		{
			selectedFilesDiv.append( filesHTMList[i] );
		}
		// Update files downloads count
		downloadModalContainer.find('#filesCount .stat-desc').text(getFilesListCount()+' files.');
		// Update total downloads size
		downloadModalContainer.find('#totalFilesSizes .stat-desc').text( formatBytesToStr(getTotalDownloadsSize()) );
		// Set minimized title
		minimizedDownloadModal.find('.modal-title').text('Downloading ('+getFilesListCount()+') Files.');
	}
	// Get files in dialog count
	function getFilesListCount()
	{
		var filesElementsList = downloadModalContainer.find('[data-role="FILE"]');
		return filesElementsList.length;
	}
	// Get total downloads size
	function getTotalDownloadsSize()
	{
		var filesElementsList = downloadModalContainer.find('[data-role="FILE"]');
		var size = 0;
		for (var i = 0; i < filesElementsList.length; i++) 
		{
			var file = $(filesElementsList[i]);
			size += file.data('filesize');
		}

		return size;
	}
	// Clear all downloads
	function clearAll()
	{
		var filesElementsList = downloadModalContainer.find('[data-role="FILE"]');
		for (var i = 0; i < filesElementsList.length; i++) 
		{
			$(filesElementsList[i]).remove();
		}
	}
}
// Get selected files
SelectedFilesAndFoldersWrapper = () =>
{
	var SELECTED_FILES_WRAPPER = TOP_NAV_CONTAINER.find('.selected-files-wrapper');
	var clearSelectionBTN = SELECTED_FILES_WRAPPER.find('#clearSelectionBTN');
	var moveSelectedToTrashBTN = SELECTED_FILES_WRAPPER.find('#moveSelectedToTrashBTN');
	var restoreSelectedFromTrashBTN = SELECTED_FILES_WRAPPER.find('#restoreSelectedFromTrashBTN');
	var deleteSelectedBTN = SELECTED_FILES_WRAPPER.find('#deleteSelectedBTN');
	var cutSelectedBTN = SELECTED_FILES_WRAPPER.find('#cutSelectedBTN');
	var moveSelectedBTN = SELECTED_FILES_WRAPPER.find('#moveSelectedBTN');

	var SELECTIONS = {
		files: []
	};
	var OPERATION = '';

	// Clear selection
	clearSelectionBTN.off('click');
	clearSelectionBTN.on('click', e =>
	{
		clearSelection();
	});
	// Move selection to trash
	moveSelectedToTrashBTN.off('click');
	moveSelectedToTrashBTN.on('click', e =>
	{
		PromptConfirmDialog('Confirm', 'Are you sure?').then(confirmed =>
		{
			var url = API_END_POINT+'files/moveSelectedToTrash';
			var data = {
				userId: getUserConfig().userId,
				files: SELECTIONS.files
			};
			// Display loader
			PageLoader();
			sendAPIPostRequest(url, data).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				DialogBox('Notice', response.message);
				// Clear Selection
				clearSelection();
			});
		});
	});
	// Move selection to trash
	restoreSelectedFromTrashBTN.off('click');
	restoreSelectedFromTrashBTN.on('click', e =>
	{
		var url = API_END_POINT+'files/restoreSelectedFromTrash';
		var data = {
			userId: getUserConfig().userId,
			files: SELECTIONS.files
		};
		// Display loader
		PageLoader();
		sendAPIPostRequest(url, data).then(response =>
		{
			// Hide loader
			PageLoader(false);
			if ( response.code == 404 )
			{
				DialogBox('Error', response.message);
				return;
			}
			DialogBox('Notice', response.message);
			// Clear Selection
			clearSelection();
		});
	});
	// Delete selected
	deleteSelectedBTN.off('click');
	deleteSelectedBTN.on('click', e =>
	{
		e.preventDefault();
		PromptConfirmDialog('Confirm Delete', 'Are you sure?').then(confirmed =>
		{
			var url = API_END_POINT+'files/deleteSelected';
			var data = {
				userId: getUserConfig().userId,
				files: SELECTIONS.files
			};
			// Display loader
			PageLoader();
			sendAPIPostRequest(url, data).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				DialogBox('Notice', response.message);
				// Clear Selection
				clearSelection();
			});
		});
	});
	// Cut selected files
	cutSelectedBTN.off('click');
	cutSelectedBTN.on('click', e =>
	{
		setOperation('MOVE');
	});
	// Move selected files
	moveSelectedBTN.off('click');
	moveSelectedBTN.on('click', e =>
	{
		if ( operation() == 'MOVE' )
		{
			var url = API_END_POINT+'files/moveSelectedToFolder';
			var data = {
				userId: getUserConfig().userId,
				filesList: SELECTIONS.files,
				dir: getCurrentDir()
			};
			// Display loader
			PageLoader();
			sendAPIPostRequest(url, data).then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				DialogBox('Notice', response.message);
				// refresh
				rebindEvents();
				// Clear selections
				clearSelection();
			});
		}
	});

	var filesChecks = $('[data-role="FILE_CHECK"]');
	var parent = filesChecks.closest('[data-role="FILE"]');
	var parentFolder = parent.data('folder');
	// Toggle needed buttons
	if ( parentFolder == 'MY_FILES' )
	{
		moveSelectedToTrashBTN.show(0);
		restoreSelectedFromTrashBTN.hide(0);
	}
	else if ( parentFolder == 'TRASH' )
	{
		moveSelectedToTrashBTN.hide(0);
		restoreSelectedFromTrashBTN.show(0);
	} 
	else
		return;
	var sfList = [];
	for (var i = 0; i < filesChecks.length; i++) 
	{
		var check = $(filesChecks[i]);
		if ( check.is(':checked') )
			sfList.push( check.data('fileid') );
	}
	// Set Selections
	SELECTIONS.files = sfList;
	// Display selected files wrapper
	if ( sfList.length > 0 )
	{
		SELECTED_FILES_WRAPPER.show(0);
		// Set files count
		SELECTED_FILES_WRAPPER.find('#filesCount').text(sfList.length+' files.');
		// Display checks
		filesChecks.show(0);
		// Display delete button
		deleteSelectedBTN.css('display', 'block');
	}
	else
	{
		SELECTED_FILES_WRAPPER.hide(0);
		// Set files count
		SELECTED_FILES_WRAPPER.find('#filesCount').text('0 files.');
		// Hide checks
		filesChecks.hide(0);
	}

	// Clear files selections
	function clearSelection()
	{
		var filesChecks = $('[data-role="FILE_CHECK"]');
		for (var i = 0; i < filesChecks.length; i++) 
		{
			var check = $(filesChecks[i]);
			if ( check.is(':checked') )
			{
				check.attr('checked', false);
			}	
				
		}
		SELECTED_FILES_WRAPPER.hide(0);
		// Hide checks
		filesChecks.hide(0);
		// set operation
		setOperation('');
		// Rebind events
		rebindEvents();
	}
	// Set pastable
	function setOperation(op)
	{
		OPERATION = op;
		if ( OPERATION == 'MOVE' )
		{
			moveSelectedBTN.css('display','block')
			.parent().siblings().find('.nm-link').css('display', 'none');
		}
		else
		{
			clearSelectionBTN.parent().siblings().find('.nm-link').css('display', 'block');
			moveSelectedBTN.css('display', 'none');
			deleteSelectedBTN.css('display', 'none');
		}
		clearSelectionBTN.css('display', 'block');
	}
	// is pastable
	function operation()
	{
		return OPERATION;
	} 
}
// Dialog Box
DialogBox = (title = 'معلومة', html) =>
{
	var modalDialogBoxTogglerBTN = $('#modalDialogBoxTogglerBTN');
	var modalDialogBox = $('#modalDialogBox');
	var mbdTitle = modalDialogBox.find('#mbdTitle');
	var mdbBody = modalDialogBox.find('#mdbBody');
	// Display
	modalDialogBoxTogglerBTN.trigger('click');
	// Set Title
	mbdTitle.html(title);
	// Set HTML
	mdbBody.html(html);
}
// Toast
CreateToast = (title = '', body = '', time = 'Now', delay = 20000) =>
{
	var toastContainer = $('#toastContainer');

	// Create toast
	var tclass = uniqid();
	var toastHTML = `<div class="${tclass} toast" role="alert" aria-live="polite" aria-atomic="true" data-delay="${delay}">
						<div class="toast-header">
							<img src="src/assets/img/utils/notify.png" style="width: 15px; height:15px;" class="rounded me-2" alt="...">
							<strong class="me-auto">${title}</strong>
							<small class="text-muted">${time}</small>
							<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
						</div>
						<div class="toast-body" style="font-weight: 300;">
							${body}...
						</div>
					</div>`;
	toastContainer.append(toastHTML);
	// Get list of toasts
	var toastEl = toastContainer.find('.'+tclass)[0];
	var toast = new bootstrap.Toast(toastEl, 'show');
	// Delete all toasts when finished hiding
	//for (var i = 0; i < toastList.length; i++) 
	//{
		//var toast = toastList[i];
		//toast._config.autohide = false;
		toast._config.delay = $(toast._element).data('delay');
		toast.show();
		toast._element.addEventListener('hidden.bs.toast', () =>
		{
			$(toast._element).remove();
		});
		setTimeout(() => { $(toast._element).remove(); }, toast._config.delay);
	//}
}
// Select directory dialog
SelectDirDialog = () =>
{
	return new Promise((resolve, reject) =>
	{
		ipcIndexRenderer.send('show-select-dir-dialog');
		ipcIndexRenderer.removeAllListeners('dialog-dir-selected');
		ipcIndexRenderer.on('dialog-dir-selected', (e, arg) =>
		{
			if ( arg.canceled )
			{
				reject(arg);
				return;
			}
			resolve(arg);
		});
	});
}
// Upload Dialog
UploadDialog = () =>
{
	var uploadModalContainer = $('#uploadModalContainer');
	var closeUploaderBTN = uploadModalContainer.find('#closeUploaderBTN');
	var minimizeUploaderBTN = uploadModalContainer.find('#minimizeUploaderBTN');
	var selectFileInput = uploadModalContainer.find('.modal-body #selectFileInput');
	var fileSelectorDiv = uploadModalContainer.find('.modal-body #fileSelectorDiv');
	var selectFileDiv = fileSelectorDiv.find('#selectFileDiv');
	var selectedFilesDiv = uploadModalContainer.find('.modal-body #selectedFilesDiv');
	var cancelUploadBTN = uploadModalContainer.find('.modal-footer #cancelUploadBTN');
	var beginUploadBTN = uploadModalContainer.find('.modal-footer #beginUploadBTN');
	var statsDiv = uploadModalContainer.find('.modal-footer #statsDiv');

	var minimizedUploadModalContainer = $('#minimizedUploadModal');
	var maximizeUploaderBTN = minimizedUploadModalContainer.find('#maximizeUploaderBTN');

	// Display uploader
	uploadModalContainer.addClass('active');
	// Clear html
	uploadModalContainer.find('.modal-body');
	// Display file selector
	fileSelectorDiv.show(50);
	// Hide selected files
	selectedFilesDiv.hide(50);
	// Disable begin upload button
	beginUploadBTN.attr('disabled', true);
	// Reset uploader stats
	statsDiv.find('#filesCount .stat-desc').text('0 files');
	statsDiv.find('#totalFilesSizes .stat-desc').text('0 bytes');
	// Close 
	closeUploaderBTN.off('click');
	closeUploaderBTN.on('click', e =>
	{
		e.preventDefault();

		if ( getFilesInUploader().length == 0 )
		{
			uploadModalContainer.removeClass('active');
			clearSelectedFiles();
			return;
		}
		PromptConfirmDialog('Confirm Close', 'Are you sure? This will cancel all uploads.').then(confirmed =>
		{
			uploadModalContainer.removeClass('active');
			clearSelectedFiles();
			// Abort all upload requests
			var reqs = getUploadRequests();
			for (var i = 0; i < reqs.length; i++) 
			{
				reqs[i].abort();
			}
		});
	});
	// Minimize
	minimizeUploaderBTN.off('click');
	minimizeUploaderBTN.on('click', e =>
	{
		e.preventDefault();
		uploadModalContainer.addClass('minimized');
		minimizedUploadModalContainer.addClass('active');
	});
	// Restore
	maximizeUploaderBTN.off('click');
	maximizeUploaderBTN.on('click', e =>
	{
		e.preventDefault();
		uploadModalContainer.removeClass('minimized');
		minimizedUploadModalContainer.removeClass('active');
	});
	cancelUploadBTN.off('click');
	cancelUploadBTN.on('click', e =>
	{
		if ( getFilesInUploader().length == 0 )
		{
			uploadModalContainer.removeClass('active');
			clearSelectedFiles();
			return;
		}
		PromptConfirmDialog('Confirm Close', 'Are you sure? This will cancel all uploads.').then(confirmed =>
		{
			uploadModalContainer.removeClass('active');
			clearSelectedFiles();
			// Abort all upload requests
			var reqs = getUploadRequests();
			for (var i = 0; i < reqs.length; i++) 
			{
				reqs[i].abort();
			}
		});
	});
	// Drop files
	fileSelectorDiv.off('drop');
	fileSelectorDiv.on('drop', e =>
	{
		var files = e.originalEvent.dataTransfer.files;
		prepareSelectedFiles(files);
	});
	// Select files
	selectFileDiv.off('click');
	selectFileDiv.on('click', e =>
	{
		selectFileInput.trigger('click');
	});
	// Capture files
	var fd = new FormData();
	var totalSelectedFiles = 0;
	var totalSelectedFilesSize = 0;
	selectFileInput.off('change');
	selectFileInput.on('change', e =>
	{
		var target = $(e.target);
		if ( target[0].files.length == 0 )
			return;

		prepareSelectedFiles(target[0].files);
		
		target.val('');
	});
	// Begin upload
	beginUploadBTN.off('click');
	beginUploadBTN.on('click', () =>
	{
		
		var filesDivList = selectedFilesDiv.find('.file');
		const asyncLoop = async () =>
		{
			for (var i = 0; i < fd.getAll('file').length; i++) 
			{
				var fileDiv = $(filesDivList[i]);
				var fdProgress = fileDiv.find('.progress .progress-bar');
				var fdStatsDiv = fileDiv.find('.stats-div');
				var file = fd.getAll('file')[i];
				var fileData = new FormData();
				fileData.append('file', file);
				fileData.append('userId', getUserConfig().userId);
				fileData.append('fileSizeObject', JSON.stringify(formatBytes( file.size )) );
				fileData.append('dir', getCurrentDir() );
				var url = API_END_POINT+'files/upload';
				await uploadFiles(url ,fileData, (e, timeleft, transferSpeed, progress) =>
				{
					fdProgress.css('width', progress+'%').text(progress.toFixed(2)+'%');
					fdStatsDiv.find('#uploadSpeed .stat-desc').text(formatTransferBytes(transferSpeed));
					fdStatsDiv.find('#uploadTimeLeft .stat-desc').text(formatTimeRemaining(timeleft));
					$(fdStatsDiv.find('#uploadedBytes .stat-desc')[0]).text( formatBytesToStr(e.loaded)+ ' | ' );
					$(fdStatsDiv.find('#uploadedBytes .stat-desc')[1]).text( formatBytesToStr(file.size) );
				},
				beforeUpload =>
				{
					// Disable begin upload button
					beginUploadBTN.attr('disabled', true);
					fdProgress.removeClass('bg-success').css('width', '0%');
				}).then(response =>
				{			
					if ( response.code == 404 )
					{
						fdProgress.text(response.message).addClass('bg-danger');
						return;
					}
					// Remove file element
					fileDiv.remove();
					fdProgress.text('Complete');
				});
			}
			// Reset
			// Clear form data
			fd.delete('file');
			// Clear html
			uploadModalContainer.find('.modal-body');
			// Display file selector
			fileSelectorDiv.show(50);
			// Hide selected files
			selectedFilesDiv.hide(50);
			// Disable begin upload button
			beginUploadBTN.attr('disabled', true);
			// Reset uploader stats
			statsDiv.find('#filesCount .stat-desc').text('0 files');
			statsDiv.find('#totalFilesSizes .stat-desc').text('0 bytes');
			// After finish upload all files //
			// Rebind events
			rebindEvents();
		}
		asyncLoop();
		
	});

	// Prepare selected files for upload
	function prepareSelectedFiles(files)
	{
		if ( files.length == 0 )
			return;

		// Enabled begin upload button
		beginUploadBTN.attr('disabled', false);
		// Hide file selector
		fileSelectorDiv.hide(50);
		// Display selected files
		selectedFilesDiv.show(50);
		var html = '';
		for (var i = 0; i < files.length; i++) 
		{
			var file = files[i];
			// Count total files
			totalSelectedFiles++;
			// Count total files size
			totalSelectedFilesSize += file.size;
			fd.append('file', file);
			if ( extractFileExtension(file.name) == 'rar' 
				|| extractFileExtension(file.name) == 'zip' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="far fa-file-archive"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'txt' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="far fa-file-alt"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'doc'
					  || extractFileExtension(file.name) == 'docx' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="far fa-file-word"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'html' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="fab fa-html5"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'js' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="fab fa-node-js"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'css' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="fab fa-css3-alt"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'php' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="fab fa-php"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'csv' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="fas fa-file-csv"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'xls'
					|| extractFileExtension(file.name) == 'xlsx' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="fas fa-table"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'pdf' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="far fa-file-pdf"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'mp4'
					|| extractFileExtension(file.name) == 'webm'
					|| extractFileExtension(file.name) == 'mkv'
					|| extractFileExtension(file.name) == 'flv'
					|| extractFileExtension(file.name) == 'ogg'
					|| extractFileExtension(file.name) == 'avi'
					|| extractFileExtension(file.name) == 'mov'
					|| extractFileExtension(file.name) == 'ts'
					|| extractFileExtension(file.name) == 'wmv'
					|| extractFileExtension(file.name) == 'm4p'
					|| extractFileExtension(file.name) == 'm4v'
					|| extractFileExtension(file.name) == 'mpg'
					|| extractFileExtension(file.name) == 'mpeg'
					|| extractFileExtension(file.name) == 'mpe'
					|| extractFileExtension(file.name) == 'mpv'
					|| extractFileExtension(file.name) == '3gp' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="fas fa-film"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else if ( extractFileExtension(file.name) == 'png'
					|| extractFileExtension(file.name) == 'gif'
					|| extractFileExtension(file.name) == 'jpg'
					|| extractFileExtension(file.name) == 'jpeg'
					|| extractFileExtension(file.name) == 'apng'
					|| extractFileExtension(file.name) == 'avif'
					|| extractFileExtension(file.name) == 'svg'
					|| extractFileExtension(file.name) == 'webp'
					|| extractFileExtension(file.name) == 'bmp'
					|| extractFileExtension(file.name) == 'ico'
					|| extractFileExtension(file.name) == 'cur'
					|| extractFileExtension(file.name) == 'tif'
					|| extractFileExtension(file.name) == 'tiff' )
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="far fa-image"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}
			else
			{
				html += `<div class="file list-view">
						<div class="icon"><i class="far fa-file"></i></div>
						<span class="name">${ file.name.substr(0, 50) }...</span>
						<span class="info">${formatBytesToStr(file.size)}</span>
						<div class="progress">
						  	<div class="progress-bar progress-bar-striped " role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Queued</div>
						</div>
						<div class="stats-div">
							<div class="stat" id="uploadSpeed">
								<span class="stat-title">Upload speed: </span>
								<span class="stat-desc">0 Kbps</span>
							</div>
							<div class="stat" id="uploadTimeLeft">
								<span class="stat-title">Timeleft: </span>
								<span class="stat-desc">0 secs...</span>
							</div>
							<div class="stat" id="uploadedBytes">
								<span class="stat-title">Uploaded: </span>
								<span class="stat-desc">0 bytes / </span>
								<span class="stat-desc">0 bytes</span>
							</div>
						</div>
					</div>`;
			}

		}
		// Display stats
		statsDiv.find('#filesCount .stat-desc').text(totalSelectedFiles+' files');
		statsDiv.find('#totalFilesSizes .stat-desc').text(formatBytesToStr(totalSelectedFilesSize));

		selectedFilesDiv.html(html);
	}
	// get files in uploader
	function getFilesInUploader()
	{
		var files = [];
		var filesList = selectedFilesDiv.find('.file');
		for (var i = 0; i < filesList.length; i++) 
		{
			var fileElement = $(filesList[i]);
			files.push( {element: fileElement} );
		}

		return files;
	}
	// Clear selected files
	function clearSelectedFiles()
	{
		selectedFilesDiv.html('');
	}
}



});
