var OpenbizMo =
{
		
	init:function()
	{
		document.addEventListener('deviceready', OpenbizMo.checkConnection, false);
		document.addEventListener('online', OpenbizMo.checkDeviceOnline, false);
		if(window.localStorage.getItem('server_system_name'))
		{
			$('#main #remote-system-name').text(window.localStorage.getItem('server_system_name'));
		};
		if(window.localStorage.getItem('server_system_icon'))
		{
			$('#main .server-logo').src=window.localStorage.getItem('server_system_icon');
		}
	},
	
	
	
	checkConnection:function() {
	    var networkState = navigator.network.connection.type;
	    console.log("Connection Status: "+networkState);
	    if( networkState==Connection.NONE || 
	    	networkState==Connection.UNKNOWN)
	    {
	    	$.mobile.changePage( "#lost-connection", { transition: "slideup"} );
	    }
		
	},
	
	
	checkDeviceOnline:function(){
		var networkState = navigator.network.connection.type;
		if( networkState!=Connection.NONE && 
		    networkState!=Connection.UNKNOWN)
		    {				
				$.mobile.changePage( "#main", { transition: "slidedown"} );
		    }
	},
	
	
	saveAndLogin:function()
	{		
		//check Server
		if(!$('#account-setting-form').validate().element('#account-setting #server_uri')){
			return false;
		}		
		server_uri = $('#account-setting #server_uri').val();
		OpenbizMo.checkServer(server_uri);
		
		//validate login 
		if( !$('#account-setting-form').validate().element('#account-setting #username') ||
			!$('#account-setting-form').validate().element('#account-setting #password')){
			return false;
		}
		credential = {				
				username: $('#account-setting #username').val(),
				password: $('#account-setting #password').val()
		};
		OpenbizMo.remoteLogin(server_uri,credential);
		return false;
	},
	
	
	checkServer:function(server_uri)
	{

		//validate server address
		$.mobile.loading( 'show', {
			text: 'Validating Server ...',
			textVisible: true,
			theme: 'b',
			html: ""
		});
		remote_api = server_uri + '/ws.php/system/mobile/getserverinfo/?format=jsonp';
		$.ajax({
			url:remote_api,
			dataType: 'jsonp',
			jsonpCallback: 'jsonCallbackCheckServer',
	        contentType: "application/json",
	        type:'GET',
			success: function(result)
			{
				console.log(result.data.system_name);
				console.log(result.data.system_icon);
				$.mobile.loading( 'hide' );
				window.localStorage.setItem('server_uri',	server_uri);
				window.localStorage.setItem('server_system_name',	result.data.system_name);
				window.localStorage.setItem('server_system_icon',	result.data.system_icon);
				return true;
			}
		});
	},
	
	Login:function(){
		if(window.localStorage.getItem('server_uri') && 
			window.localStorage.getItem('username') && 
			window.localStorage.getItem('password') )
			{
				console.log(window.localStorage.getItem('server_uri'));
				credential = {				
						username: window.localStorage.getItem('username'),
						password: window.localStorage.getItem('password')
				};
				server_uri=window.localStorage.getItem('server_uri');
				OpenbizMo.remoteLogin(server_uri,credential);				
			}else{
				console.log('no crediential data');
				$.mobile.changePage( "#account-setting", { transition: "slideup"} );
			}
		
	},
	remoteLogin:function(server_uri,credential)
	{
		$('#account-setting #server_uri').blur();
		$('#account-setting #username').blur();
		$('#account-setting #password').blur();

		
		$.mobile.loading( 'show', {
			text: 'Login to server...',
			textVisible: true,
			theme: 'b',
			html: ""
		});
		remote_api = server_uri + '/ws.php/system/mobile/login/?format=jsonp';
		
		console.log(credential);
		$.ajax({
			url:remote_api,
			dataType: 'jsonp',
			jsonpCallback: 'jsonCallbackLogin',
	        contentType: "application/json",
	        data:credential,
	        type:'GET',
			success: function(result)
			{
				$.mobile.loading( 'hide' );				
				console.log(result.data.user_id);
				if(result.data.user_id)
				{
					window.localStorage.setItem('username',		credential.username);
					window.localStorage.setItem('password',		credential.password);
					console.log(window.localStorage.getItem('server_uri'));

					var anchor = document.createElement('a');
					//var default_view = '/index.php/system/general_default#app_tabs_page';
					var default_view = '/index.php/contact_mob/contact_list';
		            anchor.setAttribute('href', window.localStorage.getItem('server_uri')+default_view);		            
		            var dispatch = document.createEvent('HTMLEvents')
		            dispatch.initEvent('click', true, true);		            
		            anchor.dispatchEvent(dispatch);
		            
 					return true;
				}
				else
				{
					$.mobile.loading( 'hide' );				
					console.log('login failed!');
					var validator = $("#account-setting-form").validate();
					validator.showErrors({"password": "Incorrect password"});
					return false;
				}
			}
		});
	}
}