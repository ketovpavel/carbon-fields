/**
 * External dependencies.
 */
import { Component } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { RadioControl } from '@wordpress/components';

class RadioField extends Component {
	/**
	 * Handles the change of the radios.
	 *
	 * @param  {string} value
	 * @return {void}
	 */
	handleChange = ( value ) => {
		const { name, onChange } = this.props;

		onChange( name, value );
	}

	/**
	 * Renders the component.
	 *
	 * @return {Object}
	 */
	render() {
		const { field, value } = this.props;

		return (
			<RadioControl
				label={ field.label }
				selected={ value }
				options={ field.options }
				onChange={ this.handleChange }
			/>
		);
	}
}

addFilter( 'carbon-fields.radio-field.block', 'carbon-fields/blocks', ( OriginalRadioField ) => ( props ) => {
	return (
		<OriginalRadioField { ...props }>
			{ ( {
				field,
				name,
				value,
				handleChange
			} ) => (
				<RadioField
					field={ field }
					name={ name }
					value={ value }
					onChange={ handleChange }
				/>
			) }
		</OriginalRadioField>
	);
} );
