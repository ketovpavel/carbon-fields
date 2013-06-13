<?php

function carbon_trigger_fields_register() {
	do_action('carbon_register_fields');
	do_action('carbon_after_register_fields');
}

function carbon_init_containers() {
	Carbon_Container::init_containers();
}

function carbon_get_post_meta($id, $name, $type = null) {
	$name = $name[0] == '_' ? $name: '_' . $name;

	if ( $type == 'complex' ) {
		return carbon_get_complex_fields('CustomField', $name, $id);
	}

	return get_post_meta($id, $name, true);
}

function carbon_get_the_post_meta($name, $type = null) {
	return carbon_get_post_meta(get_the_id(), $name, $type);
}

function carbon_get_theme_option($name, $type = null) {
	if ( $type == 'complex' ) {
		return carbon_get_complex_fields('ThemeOptions', $name);
	}

	return get_option($name, true);
}

function carbon_get_term_meta($id, $name, $type = null) {
	$name = $name[0] == '_' ? $name: '_' . $name;

	if ( $type == 'complex' ) {
		return carbon_get_complex_fields('TermMeta', $name, $id);
	}

	return get_metadata('term', $id, $name, true);
}

function carbon_get_user_meta($id, $name, $type = null) {
	$name = $name[0] == '_' ? $name: '_' . $name;

	if ( $type == 'complex' ) {
		return carbon_get_complex_fields('UserMeta', $name, $id);
	}

	return get_metadata('user', $id, $name, true);
}

function carbon_get_complex_fields($type, $name, $id = null) {
	$datastore = Carbon_DataStore_Base::factory($type);
	
	if ( $id ) {
		$datastore->set_id($id);
	}

	$group_rows = $datastore->load_values($name);
	$input_groups = array();

	foreach ($group_rows as $row) {
		if ( !preg_match('~^' . preg_quote($name, '~') . '(?P<group>\w*)-_?(?P<key>.*?)_(?P<index>\d+)_?(?P<sub>\w+)?(-(?P<trailing>.*))?$~', $row['field_key'], $field_name) ) {
				continue;
		}
		
		$row['field_value'] = maybe_unserialize($row['field_value']);

		$input_groups[ $field_name['index'] ]['_type'] = $field_name['group'];
		if ( !empty($field_name['trailing']) ) {
			if ( !preg_match('~^' . preg_quote($field_name['key'], '~') . '(?P<group>\w*)-_?(?P<key>.*)_(?P<index>\d+)_?(?P<sub>\w+)?$~', $field_name['key'] . '_' . $field_name['sub'] . '-' . $field_name['trailing'], $subfield_name) ) {
				continue;
			}

			$input_groups[ $field_name['index'] ][$field_name['key']][ $subfield_name['index'] ]['_type'] = $subfield_name['group'];
			if ( !empty($subfield_name['sub']) ) {
				$input_groups[ $field_name['index'] ][$field_name['key']][ $subfield_name['index'] ][$subfield_name['key']][$subfield_name['sub']] = $row['field_value'];
			} else {
				$input_groups[ $field_name['index'] ][$field_name['key']][ $subfield_name['index'] ][$subfield_name['key']] = $row['field_value'];
			}
		} else if ( !empty($field_name['sub']) ) {
			$input_groups[ $field_name['index'] ][ $field_name['key'] ][$field_name['sub'] ] = $row['field_value'];
		} else {
			$input_groups[ $field_name['index'] ][ $field_name['key'] ] = $row['field_value'];
		}
	}

	// create groups list with loaded fields
	ksort($input_groups);

	return $input_groups;
}

function carbon_twitter_widget_registered() {
	global $wp_widget_factory;
	$widget_enabled = !empty($wp_widget_factory->widgets) && !empty($wp_widget_factory->widgets['LatestTweets']);
	$manually_enabled = defined('ENABLE_TWITTER_CONFIG') && ENABLE_TWITTER_CONFIG;

	return $widget_enabled || $manually_enabled;
}

function carbon_twitter_widget_activated() {
	return is_active_widget(false, false, 'carbon_latest_tweets', true);
}

function carbon_twitter_is_configured() {
	$option_names = array(
		'twitter_oauth_access_token',
		'twitter_oauth_access_token_secret',
		'twitter_consumer_key',
		'twitter_consumer_secret'
	);
	$configured = true;

	foreach ($option_names as $optname) {
		if (!get_option($optname)) {
			$configured = false;
			break;
		}
	}

	return $configured;
}

function carbon_twitter_is_config_valid() {
	$tweets = TwitterHelper::get_tweets('cnn', 1, true);
	if (!$tweets) {
		return false;
	}
	return true;
}

function carbon_twitter_widget_no_config_warning() {
	?>
	<div id="message" class="error">
		<p><strong>Warning: You've inserted a "Latest Tweets" widget, but it will NOT function unless you configure your twitter settings.</strong></p>
		<p><strong>In order to do that, go to <a href="<?php echo admin_url('/admin.php?page=crbn-twitter-settings.php'); ?>">Theme Options -> Twitter Settings</a></strong></p>
	</div>
	<?php
}

function carbon_twitter_widget_wrong_config_warning() {
	?>
	<div id="message" class="error">
		<p><strong>Warning: You seem to have configured your Twitter settings, but they are invalid. </strong></p>
		<p><strong>Please, configure them in order to be able to use the "Latest Tweets" widget.</strong></p>
		<p><strong>In order to do that, go to <a href="<?php echo admin_url('/admin.php?page=crbn-twitter-settings.php'); ?>">Theme Options -> Twitter Settings</a></strong></p>
	</div>
	<?php
}

add_action('admin_menu', 'carbon_twitter_widget_config_check');
function carbon_twitter_widget_config_check() {
	if (!carbon_twitter_widget_registered() || !carbon_twitter_widget_activated()) {
		return;
	}

	if (!carbon_twitter_is_configured()) {
		add_action('admin_notices', 'carbon_twitter_widget_no_config_warning');
	} elseif(!carbon_twitter_is_config_valid()) {
		add_action('admin_notices', 'carbon_twitter_widget_wrong_config_warning');
	}
}