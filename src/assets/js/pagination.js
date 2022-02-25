SmoothPagination = function(){};

$(function()
{


// Pagination
SmoothPagination = function(parent, dataTarget, object)
{
	this.data = object.data.filter((val) => val != '');
	this.resultsData = [];
	this.resultsPerPage = object.resultsPerPage;
	this.totalResults = this.data.length;
	this.pageLinksCount = object.linksCount;
	this.parent = parent;
	var page = 0;

	// results per page array
	var res = 0;
	var results = '';
	var resultsData = [];
	var firstPage = 0;
	for (var i=0; i <= this.data.length; i++ )
	{
		if ( res == this.resultsPerPage || i == this.data.length )
		{	
			resultsData.push(results);
			res = 0;
			results = '';

		}
		results += this.data[i];
		res++;
	}

	var totalPages = resultsData.length-1;

	// html Container
	var htmlContainer = '<div class="smooth-pagination-container"></div>';
	// Page Links
	var links = '<ul class="sp-navmenu">';
	links += '<li class="spnm-list-item"><a href="#" class="spnmli-nav-link" data-role="PAGE_LINK_FIRST">First</a></li>';
	links += '<li class="spnm-list-item"><a href="#" class="spnmli-nav-link" data-role="PAGE_LINK_PREVIOUS">Previous</a></li>';
	for (var i = 0; i < this.pageLinksCount; i++) 
	{
		links += '<li class="spnm-list-item"><a href="#" class="spnmli-nav-link spnmli-page-num" data-role="PAGE_LINK">'+i+'</a></li>';
	}
	links += '<li class="spnm-list-item"><a href="#" class="spnmli-nav-link" data-role="PAGE_LINK_NEXT">Next</a></li>';
	links += '<li class="spnm-list-item"><a href="#" class="spnmli-nav-link" data-role="PAGE_LINK_LAST">Last</a></li>';
	links += '</ul>';

	var resultsPerPage = this.resultsPerPage;
	this.parent.html(htmlContainer);
	// Select Container
	var smoothPaginationContainer = $('.smooth-pagination-container');
	var htmlPagePagCounter = '<div class="spc-pagination-counter-div">';
	htmlPagePagCounter += 'Showing page <span class="spcpc-counter-label" id="spcpcPage">0</span> of <span class="spcpc-counter-label" id="spcpcTotalPages">'+totalPages+'</span>.';
	htmlPagePagCounter += '<div><span>Total Results: </span><span class="spcpc-counter-label">'+(this.totalResults)+'</span></div>';
	htmlPagePagCounter += '</div>';

	smoothPaginationContainer.html(links);
	smoothPaginationContainer.append(htmlPagePagCounter);
	// Assign page link count
	var pageLinksCount = this.pageLinksCount;
	// Current page
	var pageLinkIndex = 0;
	var pliCount = 0;
	// Page Counter
	var spcpcPage = smoothPaginationContainer.find('.spc-pagination-counter-div #spcpcPage');
	this.parent.off('click');
	this.parent.on('click', function(e)
	{
		e.preventDefault();
		
		if ( $(e.target).data('role') == 'PAGE_LINK' )
		{
			var target = $(e.target);
			page = parseInt(target.text());
			dataTarget.html( resultsData[page] );
		}
		else if ( $(e.target).data('role') == 'PAGE_LINK_NEXT' )
		{	
			var target = $(e.target);
			
			if ( page == totalPages )
				return;
			
			page++;
			dataTarget.html( resultsData[page] );
			// Re-assign page numbers to links
			pageLinkIndex = page;
			if ( pageLinkIndex > totalPages )
				return;
			for (var i = 0; i < pageLinksCount; i++) 
			{
				if ( pageLinkIndex > totalPages )
					break;
				$(smoothPaginationContainer.find('.spnmli-page-num')[i]).text(pageLinkIndex);
				pageLinkIndex++;
			}
			pliCount = pageLinkIndex;
		}
		else if ( $(e.target).data('role') == 'PAGE_LINK_PREVIOUS' )
		{
			var target = $(e.target);
			
			if ( page == firstPage )
				return;
			
			page--;
			dataTarget.html( resultsData[page] );
			// Re-assign page numbers to links
			pageLinkIndex = pliCount;
			pliCount--;
			if ( pageLinkIndex < pageLinksCount )
				return;

			pageLinkIndex--;
			for (var i = pageLinksCount-1; i >= 0; i--) 
			{
				$(smoothPaginationContainer.find('.spnmli-page-num')[i]).text(pageLinkIndex);
				pageLinkIndex--;
			}
			
		}
		else if ( $(e.target).data('role') == 'PAGE_LINK_FIRST' )
		{
			var target = $(e.target);
			
			if ( page == firstPage )
				return;
			
			page = 0;
			dataTarget.html( resultsData[page] );
			// Re-assign page numbers to links
			pliCount = 0;
			pageLinkIndex = 0;
			for (var i = pageLinksCount-1; i >= 0; i--) 
			{
				$(smoothPaginationContainer.find('.spnmli-page-num')[i]).text(i);
			}
		}
		else if ( $(e.target).data('role') == 'PAGE_LINK_LAST' )
		{
			var target = $(e.target);
			
			if ( page == totalPages )
				return;
			
			page = totalPages;
			dataTarget.html( resultsData[totalPages] );
			// Re-assign page numbers to links
			pageLinkIndex = page - pageLinksCount;
			for (var i = 0; i < pageLinksCount; i++) 
			{
				$(smoothPaginationContainer.find('.spnmli-page-num')[i]).text(pageLinkIndex);
				pageLinkIndex++;
			}
			pliCount = pageLinkIndex;
		}
		// Set page counter
		spcpcPage.text(page);
	});

	dataTarget.html( resultsData[page] );
	
}



});