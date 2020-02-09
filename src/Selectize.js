import { array, bool, func, object, oneOfType, string } from 'prop-types'
import Select from 'react-select'
import createFieldComponent from './createFieldComponent'
import createSelectize from './createSelectize'

const Selectize = createFieldComponent(createSelectize(Select))
// const Selectize = Select;

Selectize.propTypes = {
  field: object.isRequired,
  options: array.isRequired,
  backspaceRemovesValue: bool,
  convert: oneOfType([bool, object]),
  isClearable: bool,
  isMulti: bool,
  onChange: func,
  placeholder: string
}

Selectize.defaultProps = {
  backspaceRemovesValue: false,
  convert: false,
  isClearable: true,
  isMulti: false
}

export default Selectize
