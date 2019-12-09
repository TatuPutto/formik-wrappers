import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { noop } from 'lodash'


class OptionControl extends PureComponent {

  getWrapperComponent = () => {
    if (this.props.condenseLayout) {
      return 'div'
    }

    return 'td'
  }

  handleOnClick = () => {
    this.props.form.setFieldValue(this.props.field.name, this.props.option.value, true)
  }

  render() {

    const { field, option, condenseLayout } = this.props

    const isChecked = field.value === option.value
    const isRequired = field.value == undefined
    const isDisabled = false // this.props.config.props.disabled;
    const isCheckbox = !option.hasOwnProperty('icon')

    const style = isRequired ? /*{ border: '1px solid rgb(236, 140, 46)' } */ null : null

    const WrapperComponent = this.getWrapperComponent()
    const wrapperClassName = classnames('text-center', {
      'required': isRequired,
      'p-2': !condenseLayout,
      'flex-grow-1 mx-1': condenseLayout,
    })

    const labelClassName = classnames('btn w-100', {
      'btn-outline-secondary': !isChecked,
      [`btn-${option.color}`]: isChecked,
      'text-white': isChecked,
    })

    const wrapperStyle = {
      ...style,
      cursor: isDisabled ? 'initial' : 'pointer',
      fontSize: condenseLayout ? 'initial' : '1.25rem',
    }

    // return (
    //   <td
    //     className={tdClassName}
    //     style={tdStyle}
    //     onClick={isDisabled ? noop : this.handleOnClick}
    //   >
    //     {isCheckbox ?
    //       <input
    //         type="checkbox"
    //         checked={isChecked}
    //       />
    //       :
    //       <span
    //         className={
    //           classnames('fas align-middle', `fa-${option.icon}`, {
    //             [`text-${option.color}`]: isChecked,
    //             'text-muted-faded': isChecked,
    //             'disabled': isDisabled,
    //           })
    //         }
    //       />
    //     }
    //   </td>
    // )

    // {/*}<input
    //   type="checkbox"
    //   checked={isChecked}
    // />*/}

    return (
      <WrapperComponent
        className={wrapperClassName}
        style={wrapperStyle}
        onClick={isDisabled ? noop : this.handleOnClick}
      >
        {condenseLayout ?
          <label className={labelClassName}>
            <span
              className={
                classnames('fas align-middle', `fa-${option.icon}`, {
                  'text-muted-faded': isChecked,
                  'disabled': isDisabled,
                })
              }
            />
            {` ${option.label}`}
          </label>
          : isCheckbox ?
            <input
              type="radio"
              value={option.value}
            />
            :
              <span
                className={
                  classnames('fas align-middle', `fa-${option.icon}`, {
                    [`text-${option.color}`]: isChecked,
                    'text-muted-faded': !isChecked,
                    'disabled': isDisabled,
                  })
                }
              />
        }
      </WrapperComponent>
    )
  }
}

OptionControl.propTypes = {
  field: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  option: PropTypes.object.isRequired,
}

export default OptionControl
