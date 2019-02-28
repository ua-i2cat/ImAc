
ImAcController = function() 
{
	this.doPlay = function() { MenuFunctionsManager.getPlayPauseFunc( true )() };
	this.doPause = function() { MenuFunctionsManager.getPlayPauseFunc( false )() };
	this.volumeUp = function() { MenuFunctionsManager.getChangeVolumeFunc( true )() };
	this.VolumeDown = function() { MenuFunctionsManager.getChangeVolumeFunc( false )() };
	this.goForward = function( time ) { MenuFunctionsManager.getSeekFunc( true, time )() };
	this.goBack = function( time ) { MenuFunctionsManager.getSeekFunc( false, time )() };
	this.changePlaybackRate = function( speed ) { MenuFunctionsManager.getSpeedFunc( speed )() };
	this.enableSubtitles = function() { MenuFunctionsManager.getOnOffFunc( 'subtitlesOffButton' )() };
	this.disableSubtitles = function() { MenuFunctionsManager.getOnOffFunc( 'subtitlesOnButton' )() };
	this.enableSigner = function() { MenuFunctionsManager.getOnOffFunc( 'signLanguageOffButton' )() };
	this.disableSigner = function() { MenuFunctionsManager.getOnOffFunc( 'signLanguageOnButton' )() };
	this.enableAD = function() { MenuFunctionsManager.getOnOffFunc( 'audioDescriptionOffButton' )() };
	this.disableAD = function() { MenuFunctionsManager.getOnOffFunc( 'audioDescriptionOnButton' )() };
	this.enableAST = function() { MenuFunctionsManager.getOnOffFunc( 'audioSubtitlesOffButton' )() };
	this.disableAST = function() { MenuFunctionsManager.getOnOffFunc( 'audioSubtitlesOnButton' )() };
}