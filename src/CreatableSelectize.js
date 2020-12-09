import { array, bool, func, object, oneOfType, string } from 'prop-types'
import CreatableSelect from 'react-select/lib/Creatable'
import createSelectize from './createSelectize'

const Selectize = createSelectize(CreatableSelect)

Selectize.propTypes = {
  field: object.isRequired,
  options: array.isRequired,
  backspaceRemovesValue: bool,
  convert: oneOfType([bool, object]),
  isClearable: bool,
  isMulti: bool,
  onChange: func,
  placeholder: string,
  formatCreateLabel: string,
}

Selectize.defaultProps = {
  backspaceRemovesValue: false,
  convert: false,
  isClearable: true,
  isMulti: false
}

export default Selectize
