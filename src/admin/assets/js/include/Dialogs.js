let CreateToast;
let DialogBox;
let PromptConfirmDialog;
let PromptInputDialog;

$(function()
{

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
		// Clear input
		promptDialogTextInput.val('');
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
			if ( promptDialogTextInput.val().length == 0 )
			{
				reject(null);
				return;
			}
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


});
