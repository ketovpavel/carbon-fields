/**
 * The external dependencies.
 */
import { Fragment, Component } from '@wordpress/element';
import { ColorIndicator, ColorPalette } from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';

class ColorField extends Component {
	/**
	 * Handles the change of the colorpicker.
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
		const { value } = this.props;

		return (
			<Fragment>
				<ColorPalette
					value={ value }
					onChange={ this.handleChange }
				/>

				<ColorIndicator colorValue={ value } />
			</Fragment>
		);
	}
}

addFilter( 'carbon-fields.color-field.block', 'carbon-fields/blocks', ( OriginalColorField ) => ( props ) => {
	return (
		<OriginalColorField { ...props }>
			{ ( {
				field,
				name,
				value,
				handleChange
			} ) => (
				<ColorField
					field={ field }
					name={ name }
					value={ value }
					onChange={ handleChange }
				/>
			) }
		</OriginalColorField>
	);
} );
