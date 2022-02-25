window.$ = window.jQuery = require('jquery');

$(function()
{

var QUOTES_JSON = [
	{
		text: `A file-sharing service and a hedge fund are essentially the same things. In both cases, there's this idea that whoever has the biggest computer can analyze everyone else to their advantage and concentrate wealth and power. It's shrinking the overall economy. I think it's the mistake of our age.`,
		author: 'Jaron Lanier'
	},
	{
		text: `I always say if you've seen good acting on television, those actors are really good. Because there's just not enough time. You don't have any preparation.`,
		author: 'Sasha Alexander'
	},
	{
		text: `Spotify appeared nine years after Napster, the pioneering file-sharing service, which unleashed piracy on the record business and began the cataclysm that caused worldwide revenues to decline from a peak of twenty-seven billion dollars in 1999 to fifteen billion in 2013.`,
		author: 'John Seabrook'
	},
	{
		text: `It's hard for us to talk about how we disdain file-sharing when in fact it probably has been a great resource for us.`,
		author: 'Colin Meloy'
	},
	{
		text: `When I was younger, I'd buy a vinyl album, take it home and live with it, and I think that attachment's largely gone for the file-sharing generation.`,
		author: 'Anton Corbijn'
	},
	{
		text: `The war against illegal file-sharing is like the church's age-old war against masturbation. It's a war you just can't win.`,
		author: 'Lawrence Lessig'
	},
	{
		text: `Today, we see some "file sharing" sites that rely on fans uploading cracked copies of ebooks, and which then make money off those books by charging for downloads (via cash subscriptions or advertising). Again: I take a dim view of this. They're making money off the back of my work without paying me.`,
		author: 'Charles Stross'
	},
	{
		text: `New generations have unprecedented power to make great changes. Take the music business for example. The new generations have toppled the music industry by file sharing, downloading, and Myspace. Rock 'n' roll belongs to the people.`,
		author: 'Patti Smith'
	},
	{
		text: `The big news already broke. The file-sharing and all that stuff, it's a done deal. And I think figuring out how to make that a fair exchange for the people that make music is still an issue.`,
		author: 'Liz Phair'
	},
	{
		text: `A society that admits misery, a humanity that admits war, seem to me an inferior society and a debased humanity; it is a higher society and a more elevated humanity at which I am aiming - a society without kings, a humanity without barriers.`,
		author: 'Victor Hugo'
	},
	{
		text: `File sharing is our radio; that's the way people hear our stuff.`,
		author: 'Guy Picciotto'
	},
];


var loadingScreenContainer = $('#loadingScreenContainer');
var quoteTextContent = loadingScreenContainer.find('#quoteTextContent');
var quoteAuthorFirst = loadingScreenContainer.find('#quoteAuthorFirst');
var quoteAuthorLast = loadingScreenContainer.find('#quoteAuthorLast');

var delay = 5;
var current = randomRange(0, QUOTES_JSON.length);

// First time quote
quoteTextContent.text( QUOTES_JSON[current].text ).append('<span class="cursor"></span>');
quoteAuthorFirst.text( QUOTES_JSON[current].author.split(' ')[0] );
quoteAuthorLast.text( QUOTES_JSON[current].author.split(' ')[1] );

var interval = setInterval( () => 
{
	if ( current == QUOTES_JSON.length )
		current = 0;

	quoteTextContent.text( QUOTES_JSON[current].text ).append('<span class="cursor"></span>');
	quoteAuthorFirst.text( QUOTES_JSON[current].author.split(' ')[0] );
	quoteAuthorLast.text( QUOTES_JSON[current].author.split(' ')[1] );
	current++;

}, delay * 1000);

// Random range
function randomRange(min, max) 
{ 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

});