import { bool, func, object, oneOfType, string } from 'prop-types'
import AsyncSelect from 'react-select/lib/Async'
import createSelectize from './createSelectize'

const AsyncSelectize = createSelectize(AsyncSelect, true)

AsyncSelectize.propTypes = {
  field: object.isRequired,
  loadOptions: func,
  loadUrl: string,
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
  defaultOptions: true,
  isClearable: true,
  isMulti: false
}

export default AsyncSelectize

// export default createFieldComponent(createSelectize(AsyncSelectize, true))
