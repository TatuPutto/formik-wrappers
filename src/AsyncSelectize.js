import { bool, func, object, oneOfType, string } from 'prop-types'
import AsyncSelect from 'react-select/lib/Async'
import createSelectize from './createSelectize'

const AsyncSelectize = createSelectize(AsyncSelect)

AsyncSelectize.propTypes = {
  field: object.isRequired,
  loadOptions: func.isRequired,
  backspaceRemovesValue: bool,
  convert: oneOfType([bool, object]),
  defaultOptions: bool,
  isClearable: bool,
  isMulti: bool,
  onChange: func,
  placeholder: string
}

AsyncSelectize.defaultProps = {
  backspaceRemovesValue: false,
  convert: false,
  defaultOptions: false,
  isClearable: true,
  isMulti: false
}

export default AsyncSelectize
