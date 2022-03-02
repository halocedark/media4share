$(function()
{

// Clear loader on page complete load
$('#loadingScreen').remove();
// Setup side navbar
function setupSideNavbar()
{
	var sideNavBarMenu = AP_SIDE_NAVBAR_CONTAINER.find('#sideNavBarMenu');
	var avatarDiv = AP_SIDE_NAVBAR_CONTAINER.find('.avatar');
	var detailsDiv = AP_SIDE_NAVBAR_CONTAINER.find('.details');

	// Display user details
	var avatar = getUserConfig().userAvatar;
	if ( avatar == null || avatar == 0 )
		avatar = APP_DIR_NAME+'assets/img/utils/user.png';

	avatarDiv.find('img').attr('src', avatar);
	detailsDiv.find('.fullname').text( getUserConfig().fullName );
	detailsDiv.find('.email').text( getUserConfig().userEmail );
	// Change page
	sideNavBarMenu.off('click');
	sideNavBarMenu.on('click', e =>
	{
		var target = $(e.target);
		
		if ( target.data('role') == 'NAV_LINK' )
		{
			e.preventDefault();
			var href = target.attr('href');

			var page = APP_DIR_NAME+href;
			if ( href.length == 0 || href == '#' )
				return;

			getPage(page).then(response =>
			{
				AP_MAIN_CONTENT_CONTAINER.html(response);
				// Re assign events
				AP_rebindEvents();
				// Set navlink active
				sideNavBarMenu.find('[data-role="NAV_LINK"], [data-role="NAV_LINK_DROP_DOWN_TOGGLER"]').removeClass('active');
				sideNavBarMenu.find('li .dropdown-accordion').slideUp(50);
				target.addClass('active');
			});
		}
		else if ( target.data('role') == 'NAV_LINK_DROP_DOWN_TOGGLER' )
		{
			e.preventDefault();
			sideNavBarMenu.find('li .dropdown-accordion').slideUp(50);
			target.siblings('.dropdown-accordion').slideDown(200)
			.parent().find('li .dropdown-accordion').slideUp(50);
			// Set navlink active
			sideNavBarMenu.find('[data-role="NAV_LINK"], [data-role="NAV_LINK_DROP_DOWN_TOGGLER"]').removeClass('active');
			target.addClass('active');
		}
		else if ( target.data('role') == 'ACCORDION_NAV_LINK' )
		{
			e.preventDefault();
			var href = target.attr('href');

			var page = APP_DIR_NAME+href;
			if ( href.length == 0 || href == '#' )
				return;

			getPage(page).then(response =>
			{
				AP_MAIN_CONTENT_CONTAINER.html(response);
				// Re assign events
				AP_rebindEvents();
			});
		}
		else
			return;
	});
}
// Setup users
function setupUsers()
{
	var usersContainer = $('#usersContainer');
	if ( usersContainer[0] == undefined )
		return;

	var paginationDiv = usersContainer.find('#paginationDiv');
	var usersTable = usersContainer.find('#usersTable');
	var selectAllBTN = usersTable.find('#selectAllBTN');
	var usersDeleteSelectedBTN = usersContainer.find('#usersDeleteSelectedBTN');
	var usersUnapproveSelectedBTN = usersContainer.find('#usersUnapproveSelectedBTN');
	var usersSearchInput = usersContainer.find('#usersSearchInput');

	// Delete selected
	usersDeleteSelectedBTN.off('click');
	usersDeleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog('Confirm Delete', 'Are you sure?')
		.then(confirmed =>
		{
			// Display loader
			PageLoader();
			deleteUsersAccounts( getSelectedRows() )
			.then(response =>
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
				getAll();
			});
		});
	});
	// Unapprove selected
	usersUnapproveSelectedBTN.off('click');
	usersUnapproveSelectedBTN.on('click', e =>
	{
		// Display loader
		PageLoader();
		unapproveUsersAccounts( getSelectedRows() )
		.then(response =>
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
			getAll();
		});
	});
	// Search
	usersSearchInput.off('keyup');
	usersSearchInput.on('keyup', e =>
	{
		searchForUsers( usersSearchInput.val() )
		.then(response =>
		{
			// Clear html
			usersTable.find('.tbody').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userName != getUserConfig().userName )
				{
					var avatar = (v.userAvatar == null || v.userAvatar == '') ? 'assets/img/utils/user.png' : v.userAvatar;
					var isVerified = (v.isVerified == 1) ? 'Yes' : 'No';
					var isApproved = (v.isApproved == 1) ? 'Yes' : 'No';
					html += `<div class="tr" data-role="USER_ACCOUNT_ROW" data-userid="${v.userId}">
								<li class="td">
									<input type="checkbox" class="form-check-input" style="pointer-events: none;" data-role="USER_ACCOUNT_CHECK">
								</li>
								<li class="td">${v.fullName}</li>
								<li class="td">${v.userName}</li>
								<li class="td" style="pointer-events: auto;">${v.userEmail}</li>
								<li class="td">
									<img src="${avatar}" class="img-thumbnail user-img-medium rounded" alt="">
								</li>
								<li class="td">${isVerified}</li>
								<li class="td">${isApproved}</li>
								<li class="td">${v.dateRegistered}</li>
								<li class="td">
									<button class="btn btn-primary btn-sm" style="pointer-events: auto;" data-role="EDIT_USER" data-userid="${v.userId}">Edit</button>
								</li>
							</div>PAG_SEP`;					
				}
			});
			// Add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 15,
				linksCount: 0
			};
			new SmoothPagination(paginationDiv,usersTable.find('.tbody'), options);
		});
	});
	// 
	usersTable.off('click');
	usersTable.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'USER_ACCOUNT_ROW' ) // Toggle checked
		{
			var check = target.find('[data-role="USER_ACCOUNT_CHECK"]');
			check.attr('checked', !check.prop('checked'));
		}
		else if ( target.data('role') == 'EDIT_USER' ) // Change password
		{
			PromptInputDialog('Change user password', 'Enter new password here...')
			.then(input =>
			{
				var password = $.trim(input);
				// Display loader
				PageLoader();
				setUserPassword(password, target.data('userid'))
				.then(response =>
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
		}
		else if ( target.data('role') == 'USER_CPANEL' ) // Open user cpanel
		{
			// Display loader
			PageLoader();
			openUserCPanel(target.data('userid'))
			.then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}

				var data = response.data;
				data['HIGH_AUTHORITY'] = getUserConfig();
				// Save info in config file
				saveUserConfig(data, err =>
				{
					if ( err )
					{
						DialogBox('Error', 'Could not save config file!');
						console.log(err);
						return;
					}
					// Got to user cpanel
					window.location.href = APP_DIR_NAME+'../../index.ejs';
				});
			});
		}
		else
			return;
	});
	// Select all
	selectAllBTN.off('click');
	selectAllBTN.on('click', e =>
	{
		var checks = usersTable.find('[data-role="USER_ACCOUNT_CHECK"]');
		checks.attr('checked', !checks.prop('checked'));
	});
	// Get all
	getAll();
	function getAll()
	{
		// Display loader
		PageLoader();
		getAllUsers().then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			usersTable.find('.tbody').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userName != getUserConfig().userName )
				{
					var avatar = (v.userAvatar == null || v.userAvatar == '') ? 'assets/img/utils/user.png' : v.userAvatar;
					var isVerified = (v.isVerified == 1) ? '<span class="alert alert-success">Yes</span>' : '<span class="alert alert-danger">No</span>';
					var isApproved = (v.isApproved == 1) ? '<span class="alert alert-success">Yes</span>' : '<span class="alert alert-danger">No</span>';
					html += `<div class="tr" data-role="USER_ACCOUNT_ROW" data-userid="${v.userId}">
								<li class="td">
									<input type="checkbox" class="form-check-input" style="pointer-events: none;" data-role="USER_ACCOUNT_CHECK">
								</li>
								<li class="td">${v.fullName}</li>
								<li class="td">${v.userName}</li>
								<li class="td" style="pointer-events: auto;">${v.userEmail}</li>
								<li class="td">
									<img src="${avatar}" class="img-thumbnail user-img-medium rounded" alt="">
								</li>
								<li class="td">${isVerified}</li>
								<li class="td">${isApproved}</li>
								<li class="td">${v.dateRegistered}</li>
								<li class="td" style="pointer-events: auto;">
									<div class="btn-group-vertical btn-group-sm">
										<button class="btn btn-primary btn-sm" data-role="EDIT_USER" data-userid="${v.userId}">Edit</button>
										<button class="btn btn-success" data-role="USER_CPANEL" data-userid="${v.userId}">Cpanel</button>
									</div>
								</li>
							</div>PAG_SEP`;				
				}
			});
			// Add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 15,
				linksCount: 0
			};
			new SmoothPagination(paginationDiv,usersTable.find('.tbody'), options);
		});
	}
	// Get selected rows
	function getSelectedRows()
	{
		var rows = [];
		var rowsList = usersTable.find('[data-role="USER_ACCOUNT_ROW"]');
		for (var i = 0; i < rowsList.length; i++) 
		{
			var selRow = $(rowsList[i]);
			var rowCheck = selRow.find('[data-role="USER_ACCOUNT_CHECK"]');
			if ( rowCheck.is(':checked') )
			{
				rows.push({userId: selRow.data('userid')});
			}
		}

		return rows;
	}
}
// Setup users waiting approval
function setupUsersWaitingApproval()
{
	var usersWaitingApprovalsContainer = $('#usersWaitingApprovalsContainer');
	if ( usersWaitingApprovalsContainer[0] == undefined )
		return;

	var paginationDiv = usersWaitingApprovalsContainer.find('#paginationDiv');
	var usersTable = usersWaitingApprovalsContainer.find('#usersTable');
	var selectAllBTN = usersTable.find('#selectAllBTN');
	var usersDeleteSelectedBTN = usersWaitingApprovalsContainer.find('#usersDeleteSelectedBTN');
	var usersApproveSelectedBTN = usersWaitingApprovalsContainer.find('#usersApproveSelectedBTN');
	var usersSearchInput = usersWaitingApprovalsContainer.find('#usersSearchInput');

	// Delete selected
	usersDeleteSelectedBTN.off('click');
	usersDeleteSelectedBTN.on('click', e =>
	{
		PromptConfirmDialog('Confirm Delete', 'Are you sure?')
		.then(confirmed =>
		{
			// Display loader
			PageLoader();
			deleteUsersAccounts( getSelectedRows() )
			.then(response =>
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
				getAll();
			});
		});
	});
	// Approve selected
	usersApproveSelectedBTN.off('click');
	usersApproveSelectedBTN.on('click', e =>
	{
		// Display loader
		PageLoader();
		approveUsersAccounts( getSelectedRows() )
		.then(response =>
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
			getAll();
		});
	});
	// Search
	usersSearchInput.off('keyup');
	usersSearchInput.on('keyup', e =>
	{
		searchForUnapprovedUsers( usersSearchInput.val() )
		.then(response =>
		{
			// Clear html
			usersTable.find('.tbody').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userName != getUserConfig().userName )
				{
					var avatar = (v.userAvatar == null || v.userAvatar == '') ? 'assets/img/utils/user.png' : v.userAvatar;
					var isVerified = (v.isVerified == 1) ? '<span class="alert alert-success">Yes</span>' : '<span class="alert alert-danger">No</span>';
					var isApproved = (v.isApproved == 1) ? '<span class="alert alert-success">Yes</span>' : '<span class="alert alert-danger">No</span>';
					html += `<div class="tr" data-role="USER_ACCOUNT_ROW" data-userid="${v.userId}">
								<li class="td">
									<input type="checkbox" class="form-check-input" style="pointer-events: none;" data-role="USER_ACCOUNT_CHECK">
								</li>
								<li class="td">${v.fullName}</li>
								<li class="td">${v.userName}</li>
								<li class="td" style="pointer-events: auto;">${v.userEmail}</li>
								<li class="td">
									<img src="${avatar}" class="img-thumbnail user-img-medium rounded" alt="">
								</li>
								<li class="td">${isVerified}</li>
								<li class="td">${isApproved}</li>
								<li class="td">${v.dateRegistered}</li>
								<li class="td" style="pointer-events: auto;">
									<div class="btn-group-vertical btn-group-sm">
										<button class="btn btn-danger" data-role="DELETE_USER" data-userid="${v.userId}">Delete</button>
										<button class="btn btn-success" data-role="APPROVE_USER" data-userid="${v.userId}">Approve</button>
									</div>
								</li>
							</div>PAG_SEP`;				
				}
			});
			// Add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 15,
				linksCount: 0
			};
			new SmoothPagination(paginationDiv,usersTable.find('.tbody'), options);
		});
	});
	// 
	usersTable.off('click');
	usersTable.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'USER_ACCOUNT_ROW' ) // Toggle checked
		{
			var check = target.find('[data-role="USER_ACCOUNT_CHECK"]');
			check.attr('checked', !check.prop('checked'));
		}
		else if ( target.data('role') == 'DELETE_USER' ) // DELETE
		{
			PromptConfirmDialog('Confirm Delete', 'Are you sure?')
			.then(confirmed =>
			{
				// Display loader
				PageLoader();
				deleteUserAccount(target.data('userid'))
				.then(response =>
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
					getAll();
				});
			});
		}
		else if ( target.data('role') == 'APPROVE_USER' ) // APPROVE
		{
			// Display loader
			PageLoader();
			approveUserAccount(target.data('userid'))
			.then(response =>
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
				getAll();
			});
		}
		else
			return;
	});
	// Select all
	selectAllBTN.off('click');
	selectAllBTN.on('click', e =>
	{
		var checks = usersTable.find('[data-role="USER_ACCOUNT_CHECK"]');
		checks.attr('checked', !checks.prop('checked'));
	});
	// Get all
	getAll();
	function getAll()
	{
		// Display loader
		PageLoader();
		getUsersWaitingApproval().then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			usersTable.find('.tbody').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userName != getUserConfig().userName )
				{
					var avatar = (v.userAvatar == null || v.userAvatar == '') ? 'assets/img/utils/user.png' : v.userAvatar;
					var isVerified = (v.isVerified == 1) ? '<span class="alert alert-success">Yes</span>' : '<span class="alert alert-danger">No</span>';
					var isApproved = (v.isApproved == 1) ? '<span class="alert alert-success">Yes</span>' : '<span class="alert alert-danger">No</span>';
					html += `<div class="tr" data-role="USER_ACCOUNT_ROW" data-userid="${v.userId}">
								<li class="td">
									<input type="checkbox" class="form-check-input" style="pointer-events: none;" data-role="USER_ACCOUNT_CHECK">
								</li>
								<li class="td">${v.fullName}</li>
								<li class="td">${v.userName}</li>
								<li class="td" style="pointer-events: auto;">${v.userEmail}</li>
								<li class="td">
									<img src="${avatar}" class="img-thumbnail user-img-medium rounded" alt="">
								</li>
								<li class="td">${isVerified}</li>
								<li class="td">${isApproved}</li>
								<li class="td">${v.dateRegistered}</li>
								<li class="td" style="pointer-events: auto;">
									<div class="btn-group-vertical btn-group-sm">
										<button class="btn btn-danger" data-role="DELETE_USER" data-userid="${v.userId}">Delete</button>
										<button class="btn btn-success" data-role="APPROVE_USER" data-userid="${v.userId}">Approve</button>
									</div>
								</li>
							</div>PAG_SEP`;				
				}
			});
			// Add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 15,
				linksCount: 0
			};
			new SmoothPagination(paginationDiv,usersTable.find('.tbody'), options);
		});
	}
	// Get selected rows
	function getSelectedRows()
	{
		var rows = [];
		var rowsList = usersTable.find('[data-role="USER_ACCOUNT_ROW"]');
		for (var i = 0; i < rowsList.length; i++) 
		{
			var selRow = $(rowsList[i]);
			var rowCheck = selRow.find('[data-role="USER_ACCOUNT_CHECK"]');
			if ( rowCheck.is(':checked') )
			{
				rows.push({userId: selRow.data('userid')});
			}
		}

		return rows;
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

	// Update user info //
	accountSettingsForm.off('submit');
	accountSettingsForm.on('submit', e =>
	{
		e.preventDefault();
		var target = $(e.target);
		if ( $.trim(target.find('#asfPasswordInput').val()) != $.trim(target.find('#asfConfirmPasswordInput').val()) )
		{
			DialogBox('Error', 'Passwords do not match!');
			return;
		}
		var fd = new FormData();

		if ( target.find('#asfImageFileInput')[0].files.length > 0 )
			fd.append('avatar', target.find('#asfImageFileInput')[0].files[0]);

		fd.append('userId', getUserConfig().userId);
		fd.append('fullname', target.find('#asfFullnameInput').val() );
		fd.append('password', target.find('#asfPasswordInput').val() );
		fd.append('username', target.find('#asfUsernameInput').val() );
		fd.append('email', target.find('#asfEmailInput').val() );
		// Display loader
		PageLoader();
		updateMyInfo(fd).then(response =>
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
	// Get user info
	getUsrInfo();
	function getUsrInfo()
	{
		// Display loader
		PageLoader();
		getUserInfo(getUserConfig().userId)
		.then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			asfFormContents.html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var userAvatar = (data.userAvatar == null || data.userAvatar == 'null' 
								|| data.userAvatar == '') ? 'assets/img/utils/user.png' : data.userAvatar;
			var html = `<div class="form-group mb-2">
							<img src="${userAvatar}" style="width: 100px;height: 100px; border-radius: 50%;" class="img-thumbnail" alt="">
							<input type="file" class="input-text mt-3" id="asfImageFileInput">
						</div>
						<div class="form-group mb-2">
							<label for="" class="form-label">Email:</label>
							<input type="email" class="input-text input-text-outline" id="asfEmailInput" value="${data.userEmail}">
						</div>
						<div class="form-group mb-2">
							<label for="" class="form-label">Username:</label>
							<input type="text" class="input-text input-text-outline" id="asfUsernameInput" value="${data.userName}">
						</div>
						<div class="form-group mb-2">
							<label for="asfFullnameInput" class="form-label">Fullname:</label>
							<input type="text" class="input-text input-text-outline" id="asfFullnameInput" required value="${ data.fullName }">
						</div>
						<div class="form-group mb-2">
							<label for="asfPasswordInput" class="form-label">Password:</label>
							<input type="password" class="input-text input-text-outline" required id="asfPasswordInput">
						</div>
						<div class="form-group mb-2">
							<label for="asfConfirmPasswordInput" class="form-label">Confirm Password:</label>
							<input type="password" class="input-text input-text-outline" required id="asfConfirmPasswordInput">
						</div>`;

			// Add html 
			asfFormContents.html(html);
			//
		});
	}
	// Server settings
	var serverSettingsAccordion = settingsContainer.find('#serverSettingsAccordion');
	var restoreServerSettingsToDefaultBTN = serverSettingsAccordion.find('#restoreServerSettingsToDefaultBTN');

	// Restore to defaults
	restoreServerSettingsToDefaultBTN.off('click');
	restoreServerSettingsToDefaultBTN.on('click', e =>
	{
		e.preventDefault();
		PromptConfirmDialog('Confirm reset settings', 'Are you sure? There\n no coming back from this.')
		.then(confirmed =>
		{
			// Display loader
			PageLoader();
			restoreServerSettingsToDefault().then(response =>
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
	});
}
// Setup privileges
function setupPrivileges()
{
	var privilegesContainer = $('#privilegesContainer');
	if ( privilegesContainer[0] == undefined )
		return;

	var permissionsBlock = privilegesContainer.find('#permissionsBlock');
	var rolesBlock = privilegesContainer.find('#rolesBlock');
	var roleAssignedPermsBlock = privilegesContainer.find('#roleAssignedPermsBlock');

	var usersDiv = privilegesContainer.find('#usersDiv');
	var usersPaginationDiv = usersDiv.find('#usersPaginationDiv');
	var upgradeUserBTN = usersDiv.find('#upgradeUserBTN');
	var selectAllUsersBTN = usersDiv.find('#selectAllUsersBTN');
	var usersTable = usersDiv.find('#usersTable');
	var usersSearchInput = usersDiv.find('#usersSearchInput');

	var ROLE = {
		id: undefined,
		name: undefined,
		nameUI: undefined
	};
	// Select perm
	permissionsBlock.off('dblclick');
	permissionsBlock.on('dblclick', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'PERM_ROW' )
		{
			var check = target.find('[data-role="PERM_CHECK"]');
			check.attr('checked', !check.prop('checked'));
			target.toggleClass('selected');
			var permId = target.data('permid');
			// Assign role perm
			// Display loader
			PageLoader();
			assignRolePerm(getSelectedRole().id, permId)
			.then(response =>
			{
				console.log(response);
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				// Get all role assigned perms
				displayAllRolesAssignedPerms(getSelectedRole().id);
			});
		}
	});
	// Select role
	rolesBlock.off('click');
	rolesBlock.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'ROLE_ROW' )
		{
			// Unselect all
			var checks = rolesBlock.find('[data-role="ROLE_CHECK"]');
			var rows = rolesBlock.find('[data-role="ROLE_ROW"]');
			checks.attr('checked', false);
			rows.removeClass('selected');
			//
			var check = target.find('[data-role="ROLE_CHECK"]');
			check.attr('checked', true);
			target.addClass('selected');
			var roleId = target.data('roleid');
			var roleName = target.data('rolename');
			var roleNameUI = target.data('rolenameui');
			// Get all role assigned perms
			displayAllRolesAssignedPerms(roleId);
			// Select role
			setSelectedRole({ id: roleId, name: roleName, nameUI: roleNameUI });
			// Get all perms
			displayAllPerms();
		}
	});
	// Delete assigned perm
	roleAssignedPermsBlock.off('click');
	roleAssignedPermsBlock.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'DELETE_ROLE_PERM' )
		{
			var permId = target.data('permid');
			var roleId = target.data('roleid');
			PromptConfirmDialog('Confirm delete assigned permission', 'Are you sure?')
			.then(confirmed =>
			{
				// Display loader
				PageLoader();
				// Unassign role perm
				unassignRolePerm(roleId, permId).then(response =>
				{
					// Hide loader
					PageLoader(false);
					if ( response.code == 404 )
					{
						DialogBox('Error', response.message);
						return;
					}
					// Get all role assigned perms
					displayAllRolesAssignedPerms(getSelectedRole().id);
				});
			});
		}
	});
	// Select all users
	selectAllUsersBTN.off('click');
	selectAllUsersBTN.on('click', e =>
	{
		var checks = usersTable.find('[data-role="USER_CHECK"]');
		checks.attr('checked', !checks.prop('checked') );
	});
	// Click on users table
	usersTable.off('click');
	usersTable.on('click', e =>
	{
		var target = $(e.target);
		if ( target.data('role') == 'USER_ROW' ) // Select one user
		{
			var check = target.find('[data-role="USER_CHECK"]');
			check.attr('checked', !check.prop('checked') );
		}
	});
	// Set user role
	upgradeUserBTN.off('click');
	upgradeUserBTN.on('click', e =>
	{
		PromptConfirmDialog('Confirm users role change', 'Are you sure?')
		.then(confirmed =>
		{
			// Display loader
			PageLoader();
			setUsersRole( getSelectedUsers(), getSelectedRole().id )
			.then(response =>
			{
				// Hide loader
				PageLoader(false);
				if ( response.code == 404 )
				{
					DialogBox('Error', response.message);
					return;
				}
				DialogBox('Notice', response.message);
				// Display users
				displayAllUsers();
			});
		});
	});
	// Search for users 
	usersSearchInput.off('keyup');
	usersSearchInput.on('keyup', e =>
	{
		searchForUsers( usersSearchInput.val() )
		.then(response =>
		{
			// Clear html
			usersTable.find('.tbody').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userName != getUserConfig().userName )
				{
					html += `<div class="tr" data-role="USER_ROW" data-userid="${v.userId}">
								<li class="td">
									<input type="checkbox" class="form-check-input" style="pointer-events: none;" data-role="USER_CHECK" data-userid="${v.userId}">
								</li>
								<li class="td">${v.fullName}</li>
								<li class="td">${v.userName}</li>
								<li class="td">${v.userEmail}</li>
								<li class="td">${v.role.roleNameUI}</li>
							</div>PAG_SEP`;
				}
			});
			// Add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 15,
				linksCount: 0
			};
			new SmoothPagination(usersPaginationDiv, usersTable.find('.tbody'), options);
		});
	});
	// Get all perms
	displayAllPerms();
	function displayAllPerms()
	{
		// Display loader
		PageLoader();
		getAllPerms().then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html 
			permissionsBlock.find('.db-list').html('');
			if ( response.code == 404 )
			{
				return;
			}

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<li class="db-list-item" data-role="PERM_ROW" data-permid="${v.permId}">
							<div class="row gx-2 gy-2">
								<div class="col-lg-1 col-md-1 d-none">
									<div class="db-flex-flex-center">
										<input type="checkbox" class="form-check-input db-list-item-check" data-role="PERM_CHECK" data-role="" data-permid="${v.permId}" data-permname="${v.permName}">
									</div>
								</div>
								<div class="col-lg col-md">
									<p class="db-list-item-widget-name-ui">
										${v.permNameUI}
									</p>
									<p class="db-list-item-widget-desc-ui">
										${v.permDesc}
									</p>
								</div>
							</div>
						</li>`;
			});
			// Add html
			permissionsBlock.find('.db-list').html(html);
		});
	}
	// Get all roles
	displayAllRoles();
	function displayAllRoles()
	{
		// Display loader
		PageLoader();
		getAllRoles().then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html 
			rolesBlock.find('.db-list').html('');
			if ( response.code == 404 )
			{
				return;
			}

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<li class="db-list-item" data-role="ROLE_ROW" data-roleid="${v.roleId}" data-rolename="${v.roleName}" data-rolenameui="${v.roleNameUI}">
							<div class="row gx-2 gy-2">
								<div class="col-lg-1 col-md-1 d-none">
									<div class="db-flex-flex-center">
										<input type="checkbox" class="form-check-input db-list-item-check" data-role="ROLE_CHECK" data-role="" data-roleid="${v.roleId}" data-rolename="${v.roleName}">
									</div>
								</div>
								<div class="col-lg col-md">
									<p class="db-list-item-widget-name-ui m-0">
										${v.roleNameUI}
									</p>
								</div>
							</div>
						</li>`;
			});
			// Add html
			rolesBlock.find('.db-list').html(html);
		});
	}
	// Get all role assigned perms
	function displayAllRolesAssignedPerms(roleId)
	{
		// Display loader
		PageLoader();
		getRoleAssignedPerms(roleId).then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html 
			roleAssignedPermsBlock.find('.db-list').html('');
			if ( response.code == 404 )
			{
				return;
			}

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				html += `<li class="db-list-item" data-role="ROLE_ASSIGNED_PERM_ROW">
							<div class="row gx-2 gy-2">
								<div class="col-lg-1 col-md-1" style="width:3%;">
									<div class="db-flex-flex-center">
										<button class="btn-close" style="pointer-events: auto;" data-role="DELETE_ROLE_PERM" data-permid="${v.permId}" data-roleid="${v.roleId}"></button>
									</div>
								</div>
								<div class="col-lg col-md">
									<p class="db-list-item-widget-name-ui m-0">
										${v.roleNameUI}
									</p>
									<p class="db-list-item-widget-desc-ui m-0">
										${v.permNameUI}
									</p>
								</div>
							</div>
						</li>`;
			});
			// Add html
			roleAssignedPermsBlock.find('.db-list').html(html);
		});
	}
	// Display users
	displayAllUsers();
	function displayAllUsers()
	{
		// Display loader
		PageLoader();
		getAllUsers().then(response =>
		{
			// Hide loader
			PageLoader(false);
			// Clear html
			usersTable.find('.tbody').html('');
			if ( response.code == 404 )
				return;

			var data = response.data;
			var html = '';
			$.each(data, (k,v) =>
			{
				if ( v.userName != getUserConfig().userName )
				{
					html += `<div class="tr" data-role="USER_ROW" data-userid="${v.userId}">
								<li class="td">
									<input type="checkbox" class="form-check-input" style="pointer-events: none;" data-role="USER_CHECK" data-userid="${v.userId}">
								</li>
								<li class="td">${v.fullName}</li>
								<li class="td">${v.userName}</li>
								<li class="td">${v.userEmail}</li>
								<li class="td">${v.role.roleNameUI}</li>
							</div>PAG_SEP`;
				}
			});
			// Add html
			var options = {
				data: html.split('PAG_SEP'),
				resultsPerPage: 15,
				linksCount: 0
			};
			new SmoothPagination(usersPaginationDiv, usersTable.find('.tbody'), options);
		});
	}
	// Get selected perms
	function getSelectedPerms()
	{
		var checks = permissionsBlock.find('[data-role="PERM_CHECK"]');
		var list = [];
		for (var i = 0; i < checks.length; i++) 
		{
			var check = $(checks[i]);
			if ( check.is(':checked') )
			{
				list.push( {id: check.data('permid'), name: check.data('permname')} );
			}
		}

		return list;
	}
	// Get selected roles
	function getSelectedRoles()
	{
		var checks = rolesBlock.find('[data-role="ROLE_CHECK"]');
		var list = [];
		for (var i = 0; i < checks.length; i++) 
		{
			var check = $(checks[i]);
			if ( check.is(':checked') )
			{
				list.push( {id: check.data('roleid'), name: check.data('rolename')} );
			}
		}

		return list;
	}
	// get selected Role
	function getSelectedRole()
	{
		return ROLE;
	}
	// Set selected role
	function setSelectedRole(roleObject)
	{
		ROLE.id = roleObject.id;
		ROLE.name = roleObject.name;
		ROLE.nameUI = roleObject.nameUI;
		// Set upgrade btn text to the selected role name
		if ( upgradeUserBTN[0] != undefined )
			upgradeUserBTN.text('Set to '+roleObject.nameUI);
	}
	// Get selected users
	function getSelectedUsers()
	{
		var checks = usersTable.find('[data-role="USER_CHECK"]');
		var list = [];
		for (var i = 0; i < checks.length; i++) 
		{
			var check = $(checks[i]);
			if ( check.is(':checked') )
			{
				list.push( {userId: check.data('userid')} );
			}
		}

		return list;
	}
}
// Rebind events
AP_rebindEvents = () =>
{
	setupSideNavbar();
	setupUsers();
	setupUsersWaitingApproval();
	setupSettings();
	setupPrivileges();
	// Init animations
	initAnimations();
}
// Call
AP_rebindEvents();




})


