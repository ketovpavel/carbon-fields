jQuery(function($) {

	function init(context) {
		var fields;

		if ( !context ) {
			context = $('body');
		};

		fields = $('.carbon-field:not(.carbon-field-skip)', context);

		fields.each(function() {
			var th = $(this),
				type = th.data('type'),
				field;

			if ( typeof carbon_field[type] == 'undefined' ) {
				return;
			};

			try {
				field = carbon_field(th);

				if ( typeof carbon_field[type] != 'undefined' ) {
					carbon_field[type](th, field);
				};
			} catch (e) {}
		});
	}

	function carbon_field(node) {
		var field = {};

		if ( node.data('carbon_field') ) {
			$.error('Field already parsed');
		};

		node.data('carbon_field', field);
		field.node = node;
		field.type = node.data('type')

		return field;
	}

	/* File and Image */
	carbon_field.File = function(element, field_obj) {
		element.find('.button-primary').click(function() {
			window.carbon_active_field = element;
			tb_show('','media-upload.php?TB_iframe=true');
		});
	}

	carbon_field.Image = function(element, field_obj) {
		element.find('.button-primary').click(function() {
			window.carbon_active_field = element;
			tb_show('','media-upload.php?type=image&amp;TB_iframe=true');
		});
	}

	/* Date picker */
	carbon_field.Date = function(element, field_obj) {
		element.find('.carbon-datepicker').datepicker({
			dateFormat: 'yy-mm-dd',
			changeMonth: true,
			changeYear: true,
			showButtonPanel: true,
			hideIfNoPrevNext: true
		});
	}

	/* Compound Field */
	carbon_field.Compound = function(element, field_obj) {
		// prepare object
		field_obj.btn_add = element.find('a[data-action=add]');
		field_obj.num_rows = element.find('.carbon-compound-row').length;
		field_obj.min_rows = element.children('.carbon-container').data('min-values');
		field_obj.max_rows = element.children('.carbon-container').data('max-values');

		field_obj.name = element.data('name');

		// init
		while( field_obj.num_rows < field_obj.min_rows ) {
			compound_add_row(field_obj);
		}

		if ( field_obj.max_rows > 0 && field_obj.num_rows >= field_obj.max_rows ) {
			field_obj.btn_add.hide();
		};

		// Hook events

		field_obj.btn_add.click(function() {
			compound_add_row(field_obj);
			return false;
		});

		field_obj.node.find('a[data-action=remove]').live('click', function() {
			compound_remove_row(field_obj, $(this).closest('.carbon-compound-row'));
			return false;
		});
	}

	function compound_add_row(field) {
		var sample_row, new_row;

		if ( field.max_rows > 0 && field.max_rows <= field.num_rows ) {
			alert('Maximum number of rows reached (' + field.num_rows + ')');
			return;
		};

		sample_row = field.node.find('.carbon-compound-preview');
		new_row = sample_row.clone();

		field.num_rows++;

		new_row.find('.carbon-field-skip').removeClass('carbon-field-skip');

		new_row.find('input[name*="__ei__"]').each(function() {
			var input = $(this);
			input.attr('name', input.attr('name').replace(/\[__ei__\]/, '[' + field.num_rows + ']'));
		});

		new_row.removeClass('carbon-compound-preview').addClass('carbon-compound-row').insertBefore(sample_row);
		init(new_row);

		if ( field.max_rows > 0 && field.num_rows == field.max_rows ) {
			field.btn_add.hide();
		};
	}

	function compound_remove_row (field, row) {
		row.remove();
		compound_on_update_rows(field);

		if ( field.min_rows > field.num_rows ) {
			setTimeout(function() {
				compound_add_row(field);
			}, 0);
		};

		if ( field.max_rows > 0 && field.num_rows <= field.max_rows ) {
			field.btn_add.show();
		};
	};

	function compound_on_update_rows (field) {
		var rows = field.node.find('.carbon-compound-row'),
			index = 0;

		field.num_rows = rows.length;

		rows.each(function() {
			var row = $(this);
			index ++;

			row.find('input[name^="' + field.name + '"]').each(function() {
				var input = $(this);
				input.attr('name', input.attr('name').replace(/\[\d+\]/, '[' + index + ']'));
			});
		});
	}


	/* Complex Field */
	carbon_field.Complex = function(element, field_obj) {
		// prepare object
		field_obj.group_selector = element.find('select[name$="[group]"]');
		field_obj.btn_add = element.find('a[data-action=add]');
		field_obj.num_rows = element.find('.carbon-group-row').length;
		field_obj.min_rows = element.children('.carbon-container').data('min-values');
		field_obj.max_rows = element.children('.carbon-container').data('max-values');

		field_obj.name = element.data('name');

		field_obj.new_row_type = field_obj.group_selector.val();

		// init
		if ( field_obj.max_rows > 0 && field_obj.num_rows >= field_obj.max_rows ) {
			field_obj.btn_add.hide();
		};

		// Hook events

		field_obj.btn_add.click(function() {
			complex_add_row(field_obj);
			return false;
		});

		field_obj.node.find('a[data-action=remove]').live('click', function() {
			complex_remove_row(field_obj, $(this).closest('.carbon-group-row'));
			return false;
		});

		field_obj.group_selector.change(function() {
			field_obj.new_row_type = $(this).val();
		});
	}

	function complex_add_row(field) {
		var sample_row, new_row;

		if ( field.max_rows > 0 && field.max_rows <= field.num_rows ) {
			alert('Maximum number of rows reached (' + field.num_rows + ')');
			return;
		};

		sample_row = field.node.find('.carbon-group-preview.carbon-group-' + field.new_row_type);
		new_row = sample_row.clone();

		field.num_rows++;

		new_row.find('.carbon-field-skip').removeClass('carbon-field-skip');

		new_row.find('input[name$="[__ei__][group]"]').val(field.new_row_type);

		new_row.find('input[name*="__ei__"]').each(function() {
			var input = $(this);
			input.attr('name', input.attr('name').replace(/\[__ei__\]/, '[' + field.num_rows + ']'));
		});

		new_row.removeClass('carbon-group-preview').addClass('carbon-group-row').insertBefore( field.node.find('.carbon-group-preview:first') );
		init(new_row);

		if ( field.max_rows > 0 && field.num_rows == field.max_rows ) {
			field.btn_add.hide();
		};
	}

	function complex_remove_row(field, row) {
		row.remove();
		complex_on_update_rows(field);

		if ( field.min_rows > field.num_rows ) {
			// TODO: add the correct row type
		};

		if ( field.max_rows > 0 && field.num_rows <= field.max_rows ) {
			field.btn_add.show();
		};
	}

	function complex_on_update_rows(field) {
		var th = this,
			rows = field.node.find('.carbon-group-row'),
			index = 0;

		field.num_rows = rows.length;

		rows.each(function() {
			var row = $(this);
			index ++;

			row.find('input[name^="' + field.name + '"]').each(function() {
				var input = $(this);
				input.attr('name', input.attr('name').replace(/\[\d+\]/, '[' + index + ']'));
			});
		});
	}

	init();

	window.carbon_field_init = init;
});