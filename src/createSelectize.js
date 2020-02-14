import React, { PureComponent } from 'react'
import { components } from 'react-select'
import { get, set } from 'lodash'


const Control = (props) => (
  <components.Control
    {...props}
    className="form-control p-0"
  />
)

/* eslint-disable react/prop-types */
const createSelectize = (WrappedSelectize, async = false) => {
  return class Selectize extends PureComponent {
    createIdNamePair = (option) => {
      const {
        convert,
        convertFromString,
        convertOutput
      } = this.props

      if (convertOutput) {
        const output = convertOutput.reduce((outputObj, propNameOrConfig) => {

          if (typeof propNameOrConfig === 'object' && propNameOrConfig.hasOwnProperty('path')) {
            outputObj[propNameOrConfig.as] = get(option, propNameOrConfig.path)
          } else if (typeof propNameOrConfig === 'object' && propNameOrConfig.hasOwnProperty('value')) {
            outputObj[propNameOrConfig.as] = propNameOrConfig.value
          } else {
            outputObj[propNameOrConfig] = get(option, propNameOrConfig)
          }

          return outputObj

        }, {})

        return output
      }

      if (convertFromString) {
        return option.value
      }

      if (typeof convert === 'boolean') {
        return {
          id: option.value,
          name: option.label
        }
      } else {
        return this.resolveToSourceProps(option, convert)
      }
    }

    createOption = (baseValue) => {
      const {
        convert,
        convertFromString,
        includedProps,
        sublabelProp,
      } = this.props

      let option

      if (convertFromString) {
        option = {
          value: baseValue,
          label: baseValue,
          isDisabled: this.shouldDisable(baseValue)
        }

        return option
      }

      if (typeof convert === 'boolean') {
        option = {
          value: baseValue.id,
          label: baseValue.name,
          ...sublabelProp ? { sublabel: baseValue[sublabelProp] } : null
        }
      } else {
        option = {
          value: this.resolveFromSourceProps(baseValue, convert.valueSourceProp),
          label: this.resolveFromSourceProps(baseValue, convert.labelSourceProp),
          ...sublabelProp ? { sublabel: baseValue[sublabelProp] } : null
        }
      }

      set(option, 'isDisabled', this.shouldDisable(baseValue))

      if (includedProps) {
        includedProps.forEach((propNameOrConfig) => {
          if (this.props.field.name.includes('foreman')) {
            // console.log('option', option);
            console.log('includedProps', propNameOrConfig);

          }
          if (typeof propNameOrConfig === 'object') {
            set(option, propNameOrConfig.as, get(baseValue, propNameOrConfig.path))
            // option[propNameOrConfig.as] = get(baseValue, propNameOrConfig.path)
          } else {
            set(option, propNameOrConfig, get(baseValue, propNameOrConfig))
            // option[propNameOrConfig] = get(baseValue, propNameOrConfig)
          }

        })
      }

      if (this.props.field.name.includes('foreman')) {
        console.log('option', option);

      }

      return option
    }

    shouldDisable = (option) => {
      const { disableOptionWhen } = this.props

      if (!disableOptionWhen) {
        return false
      }

      if (Array.isArray(disableOptionWhen)) {
        return disableOptionWhen.some((condition) => {
          return get(option, condition.path) === condition.is
        })
      }

      return get(option, disableOptionWhen.path) === disableOptionWhen.is
    }

    resolveFromSourceProps = (object, sourceProps) => {
      if (Array.isArray(sourceProps)) {
        return sourceProps.map((sourceProp) => object[sourceProp]).join(' ')
      } else {
        return object[sourceProps]
      }
    }

    resolveToSourceProps = (option, convert) => {
      let values = { ...this.removeSelectizeProps(option, convert) }

      if (Array.isArray(convert.valueSourceProp)) {
        convert.valueSourceProp.forEach((sourceProp, i) => {
          values[sourceProp] = option.value.split(' ')[i]
        })
      } else {
        values[convert.valueSourceProp] = option.value
      }

      if (Array.isArray(convert.labelSourceProp)) {
        convert.labelSourceProp.forEach((sourceProp, i) => {
          values[sourceProp] = option.label.split(' ')[i]
        })
      } else {
        values[convert.labelSourceProp] = option.label
      }

      return values
    }

    removeSelectizeProps = (option, convert) => {
      if (!convert) {
        return option
      }

      return Object.keys(option).reduce((obj, nextKey) => {
        if (nextKey === 'value' || nextKey === 'label' || nextKey === 'isDisabled') {
          return obj
        }

        obj[nextKey] = option[nextKey]

        return obj
      }, {})
    }

    convertObjectToValue = () => {
      const {
        field: { value },
        convert,
        convertFromString,
        isMulti
      } = this.props

      if (!convert && !convertFromString) {
        return value
      }

      if (isMulti) {
        if (Array.isArray(value)) {
          return value.map(this.createOption)
        } else {
          return []
        }
      }

      if (value) {
        return this.createOption(value)
      }
    }

    // Converts array of objects into valid react-select options.
    // Alternativelty returns the array as is if conversion is not needed.
    convertArrayToOptions = () => {
      const {
        options,
        convert,
        convertFromString
      } = this.props

      if (!options) {
        return []
      }

      if (!convert && !convertFromString) {
        return options
      }

      return options.map(this.createOption)
    }

    handleChange = (newValue) => {
      const {
        field: { name },
        form: { setFieldValue },
        convert,
        convertFromString,
        isMulti,
        onChange,
        customOnChange,
      } = this.props

      if (onChange) {
        onChange(newValue)
      }

      if (customOnChange) {
        return customOnChange(newValue)
      }

      if (!convert && !convertFromString) {
        return setFieldValue(name, newValue, true)
      }

      if (isMulti) {
        return setFieldValue(name, newValue.map(this.createIdNamePair), true)
      }

      if (newValue) {
        return setFieldValue(name, this.createIdNamePair(newValue), true)
      } else {
        return setFieldValue(name, null, true)
      }
    }

    renderOption = (props) => {
      if (
        this.props.includeValueAsSubLabel ||
        this.props.sublabelProp ||
        this.props.disabledOptionAlert
      ) {
        return (
          <components.Option {...props}>
            {this.createCustomOptionLabel(props.data)}
          </components.Option>
        )
      }

      return (
        <components.Option
          {...props}
        />
      )
    }

    createCustomOptionLabel = (option) => {
      const { disabledOptionAlert, includeValueAsSubLabel } = this.props

      return (
        <div key={option.value}>
          <div>{option.label}</div>
          <div className="text-muted">
            {includeValueAsSubLabel ?
              <small>{option.value}</small>
              :
              <small>{option.sublabel}</small>
            }
          </div>
          {disabledOptionAlert && option.isDisabled &&
            <div>
              <small className={`text-${disabledOptionAlert.color}`}>
                <span className={`fas fa-${disabledOptionAlert.icon || 'exclamation-triangle'} mr-1`} />
                {disabledOptionAlert.text}
              </small>
            </div>
          }
        </div>
      )
    }

    getTypeSpecificProps = () => {
      if (async) {
        return this.getAsyncProps()
      } else {
        return this.getSyncProps()
      }
    }

    getAsyncProps = () => {
      const asyncProps = {}

      // if (this.props.loadOptions) {
      //   asyncProps.loadOptions = this.props.loadOptions
      // } else {
      //   asyncProps.loadOptions = this.loadOptionsFromUrl
      // }
      asyncProps.loadOptions = (value) => {
        return this.props.loadOptions(value)
          .then(items => items.map(this.createOption))
      }

      return asyncProps
    }

    getSyncProps = () => {
      return {
        options: this.convertArrayToOptions()
      }
    }

    getNoOptionsMessage = () => {
      if (this.props.loading) {
        return this.props.loadingMessage || 'Loading...'
      }

      if (this.props.noOptionsMessage && this.props.noOptionsMessage.type === 'html') {
        return (
          <div
            dangerouslySetInnerHTML={{ // eslint-disable-line
              __html: this.props.resolveToFormValue(this.props.noOptionsMessage.value)
            }}
          />
        )
      } else if (this.props.noOptionsMessage) {
        return this.props.resolveToFormValue(this.props.noOptionsMessage)
      }

      return 'No options'
    }

    renderMenuList = (innerProps) => {
      if (!this.props.pagination) {
        return <components.MenuList {...innerProps} />
      }

      return (
        <components.MenuList
          {...innerProps}
        >
          {innerProps.children}
          {this.renderLoadMoreButton()}
        </components.MenuList>
      )
    }

    renderLoadMoreButton = () => {
      if (this.props.pagination.last || !this.props.options.length) {
        return null
      }

      return (
        <div
          style={{ margin: '0.25rem' }}
        >
          <button
            type="button"
            className="w-100 btn btn-light text-primary"
            style={{ height: '70px', fontSize: '1rem' }}
            disabled={this.props.loading}
            onClick={() => {
              if (this.props.loading) {
                return
              }

              this.props.loadMoreOptions()
            }}
          >
            {this.props.loading ?
              <span>
                {this.props.loadingMoreMessage || 'Loading more results...'}
              </span>
              :
              <span>
                {this.props.loadMoreMessage || 'Load more results'}
              </span>
            }
          </button>
        </div>
      )
    }

    getStyles = () => {
      const theme = this.props.viewTheme;

      return {
        control: (base, state) => ({
          ...base,
          borderColor: theme.formControl.borderColor,
          ...state.isFocused ? { ...theme.formControl.focus } : {},
          ...state.isDisabled ? { ...theme.formControl.disabled } : { backgroundColor: base.backgroundColor },
        }),
        menu: (base) => ({
          ...base,
          zIndex: 100,
        }),
        multiValue: (base, state) => ({
          ...base,
          backgroundColor: state.isDisabled ? 'rgb(210, 210, 210)' : base.backgroundColor,
        }),
        singleValue: (base, state) => ({
          ...base,
          color: state.isDisabled ? theme.formControl.disabled.color : base.color,
        }),
      }
    }

    render() {
      return (
        <WrappedSelectize
          {...this.props}
          {...this.getTypeSpecificProps()}
          isDisabled={this.props.disabled || false}
          value={this.convertObjectToValue()}
          noOptionsMessage={this.getNoOptionsMessage}
          onChange={this.handleChange}
          styles={this.getStyles()}
          components={{
            Control,
            MenuList: this.renderMenuList,
            Option: this.renderOption,
          }}
          {...this.props.handleSearchChange ?
            { onInputChange: this.props.handleSearchChange } : null}
        />
      )
    }
  }
}

export default createSelectize
