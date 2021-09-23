import React, { PureComponent } from 'react'
import { components } from 'react-select'
import { get, set, has, isEmpty, isEqual, isFunction, isString, isPlainObject } from 'lodash'


const Control = (props) => (
  <components.Control {...props} />
)

/* eslint-disable react/prop-types */
const createSelectize = (WrappedSelectize, async = false) => {
  return class Selectize extends PureComponent {
    componentDidUpdate(prevProps) {
      const prevOptions = prevProps.options;
      const nextOptions = this.props.options;

      if (
        this.props.autoSelectWhenSingleOption &&
        get(nextOptions, 'length') === 1 &&
        !isEqual(prevOptions, nextOptions)
      ) {
        this.handleChange(this.createOption(this.props.options[0]));
      }
    }

    createIdNamePair = (option) => {
      const {
        convert,
        convertToValue,
        convertFromString,
        convertOutput,
        t
      } = this.props

      const convertOpts = convertToValue ?
        convertToValue : convert;

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

      if (typeof convertOpts === 'boolean') {
        return {
          id: option.value,
          name: option.label
        }
      } else {
        return this.resolveToSourceProps(option, convertOpts);
      }
    }

    createOption = (baseValue) => {
      const {
        convertFromString,
        includeAllProps,
        includedProps,
        sublabelProp,
      } = this.props

      const convertOpts = this.getOptionConversionOptions();

      let option

      if (convertFromString) {
        option = {
          value: baseValue,
          label: baseValue,
        }

        option = this.setDisabledStatus(option, baseValue)

        return option
      }

      if (typeof convertOpts === 'boolean') {
        option = {
          value: baseValue.id,
          label: baseValue.name,
          ...sublabelProp ? { sublabel: baseValue[sublabelProp] } : null
        }
      } else {
        option = {
          value: this.resolveFromSourceProps(baseValue, convertOpts.valueSourceProp),
          label: this.resolveFromSourceProps(baseValue, convertOpts.labelSourceProp),
          ...sublabelProp ? { sublabel: baseValue[sublabelProp] } : null
        }
      }

      option = this.setOptionNotifications(option, baseValue)
      option = this.disableOptionIfNecessary(option, baseValue)

      if (includedProps || includeAllProps) {
        const propsToInclude = includeAllProps ?
           Object.keys(baseValue) : includedProps

        propsToInclude.forEach((propNameOrConfig) => {
          if (typeof propNameOrConfig === 'object') {
            if (has(propNameOrConfig, 'evaluate')) {
              return set(option, propNameOrConfig.as, 
                this.props.evaluate2(propNameOrConfig.evaluate, baseValue))
            }

            if (has(propNameOrConfig, 'value')) {
              return set(option, propNameOrConfig.as,
                propNameOrConfig.value)
            }

            set(option, propNameOrConfig.as, get(baseValue, propNameOrConfig.path))
          } else {
            set(option, propNameOrConfig, get(baseValue, propNameOrConfig))
          }
        })
      }
      return option
    }

    assertOptionCondition = (baseValue, condition) => {
      if (condition.hasOwnProperty('path')) { 
        return get(baseValue, condition.path) === condition.is
      }
      return this.props.evaluate2(condition.condition, baseValue)
    }

    setOptionNotifications = (option, baseValue) => {
      const { notifyOptionWhen } = this.props

      if (!notifyOptionWhen) {
        return option
      }

      if (Array.isArray(notifyOptionWhen)) {
        const notifications = notifyOptionWhen
          .filter((entry) => this.assertOptionCondition(baseValue, entry))
          .map((entry) => entry.notification)

        return {
          ...option,
          notifications,
        }
      }

      return option
    }

    disableOptionIfNecessary = (option, baseValue) => {
      const { disableOptionWhen } = this.props

      if (!disableOptionWhen) {
        return option
      }

      if (typeof disableOptionWhen === 'string') {
        return {
          ...option,
          isDisabled: this.props.evaluate2(disableOptionWhen, baseValue), 
        }
      }

      if (Array.isArray(disableOptionWhen)) {
        const alerts = disableOptionWhen
          .filter((entry) => this.assertOptionCondition(baseValue, entry))
          .map((entry) => entry.alert)
        
        return {
          ...option,
          isDisabled: Boolean(alerts.length),
          alerts,
        }
      }

      return option

      // return get(option, disableOptionWhen.path) === disableOptionWhen.is
    }

    resolveFromSourceProps = (object, sourceProps) => {
      if (isFunction(sourceProps)) {  
        return sourceProps(object)
      } else if (Array.isArray(sourceProps)) {
        return sourceProps.map((sourceProp) => get(object, sourceProp)).join(' ')
      } else {
        return object[sourceProps]
      }
    }

    resolveToSourceProps = (option, convert) => {
      let values = { ...this.removeSelectizeProps(option, convert) }

      if (Array.isArray(convert.valueSourceProp)) {
        convert.valueSourceProp.forEach((sourceProp, i) => {
          if (has(option, sourceProp)) {
            values[sourceProp] = get(option, sourceProp)
            return
          }
          values[sourceProp] = option.value.split(' ')[i]
        })
      } else {
        values[convert.valueSourceProp] = option.value
      }

      if (Array.isArray(convert.labelSourceProp)) {
        convert.labelSourceProp.forEach((sourceProp, i) => {
          if (has(option, sourceProp)) {
            values[sourceProp] = get(option, sourceProp)
            return
          }
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

      const excludedProps = [
        'value',
        'label',
        'sublabel',
        'isDisabled',
        'alerts',
        'notifications'
      ]

      return Object
        .keys(option)
        .reduce((obj, nextKey) => {
          if (excludedProps.includes(nextKey)) {
            return obj
          }

          obj[nextKey] = option[nextKey]

          return obj
        }, {})
    }

    // Conversion from form value to React-select compatible option.
    convertObjectToValue = () => {
      const {
        field: { value },
        convertFromString,
        isMulti
      } = this.props

      const conversionOptions = this.getValueConversionOptions();

      if (isString(value) && !convertFromString) {
        return {
          value: value,
          label: value,
        }
      } 

      if (
        value &&
        !convertFromString &&
        isEmpty(value)
      ) {
        return null
      }

      if (!conversionOptions && !convertFromString) {
        return value
      }

      if (isMulti) {
        if (Array.isArray(value)) {
          return value.map(this.createOption)
        } else if (isPlainObject(value)) {
          return [this.createOption(value)]
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
        convertFromString,
      } = this.props

      if (!options) {
        return []
      }

      if (!convert && !convertFromString) {
        return options
      }

      return options.map(this.createOption)
    }

    // Get prefered conversion options for option (object -> option).
    getOptionConversionOptions = () => {
      return has(this.props, 'convertToOption') ?
        this.props.convertToOption : has(this.props, 'convert') ?
          this.props.convert : null;
    }

    // Get prefered conversion options for value (option -> value).
    getValueConversionOptions = () => {
      return has(this.props, 'convertToValue') ?
        this.props.convertToValue : has(this.props, 'convert') ?
          this.props.convert : null;
    }

    handleChange = (newValue) => {
      const {
        field: { name },
        form: { setFieldValue },
        convertFromString,
        isMulti,
        onChange,
      } = this.props

      const conversionOptions = this.getValueConversionOptions();

      const preparedNewValue = newValue && isMulti ?
        newValue.map(this.createIdNamePair) : newValue && !isMulti ?
          this.createIdNamePair(newValue) : null;

      // Call custom onChange handler.
      if (onChange) {
        if (isMulti) {
          onChange(preparedNewValue)
        } else {
          onChange(preparedNewValue)
        }
      }

      if (!conversionOptions && !convertFromString) {
        return setFieldValue(name, newValue, true)
      }

      if (isMulti) {
        return setFieldValue(name, preparedNewValue, true)
      }

      if (newValue) {
        return setFieldValue(name, preparedNewValue, true)
      } else {
        return setFieldValue(name, null, true)
      }
    }

    renderOption = (props) => {
      if (
        this.props.includeValueAsSubLabel ||
        this.props.sublabelProp ||
        this.props.disabledOptionAlert ||
        this.props.disableOptionWhen ||
        this.props.alertOptionWhen ||
        this.props.translateLabel
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
      const {
        disabledOptionAlert,
        includeValueAsSubLabel,
        translateLabel,
        t,
      } = this.props

      return (
        <div key={option.value}>
          {translateLabel ?
            <div>{t(option.label)}</div>
            :
            <div>{option.label}</div>
          }
          <div className="text-muted">
            {includeValueAsSubLabel ?
              <small>{option.value}</small>
              :
              <small>{option.sublabel}</small>
            }
          </div>
          {option.isDisabled &&
            <div className="alert alert-warning pt-1 pb-1 pl-2 pr-2 mt-1 mb-0">
              {disabledOptionAlert ?
                <small className={`text-${disabledOptionAlert.color}`}>
                  <span className={`glyphicons glyphicons-${disabledOptionAlert.icon || 'warning-sign'} mr-1`} />
                  {t(disabledOptionAlert.text)}
                </small>
                : option.alerts.length > 1 ?
                  <small>
                    <ul style={{
                      paddingInlineStart: '1.5rem',
                      marginBottom: 0,
                    }}>
                      {option.alerts.map((alert, i) => (
                        <li key={i}>
                          {t(alert)}
                        </li>
                      ))}
                    </ul> 
                  </small>
                  :
                    <small>
                      {t(option.alerts[0])}
                    </small>
              }
           </div>
          }
          {option.notifications && option.notifications.length &&
            <div className="alert alert-warning pt-1 pb-1 pl-2 pr-2 mt-1 mb-0">
              {option.notifications.length > 1 ?
                <small>
                  <ul style={{
                    paddingInlineStart: '1.5rem',
                    marginBottom: 0,
                  }}>
                    {option.notifications.map((notification, i) => (
                      <li key={i}>
                        {t(notification)}
                      </li>
                    ))}
                  </ul> 
                </small>
                :
                  <small>
                    {t(option.notifications[0])}
                  </small>
              }
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
          .then(options => {
            return this.props.formatOptions ?
              this.props.formatOptions(options) : options
          })
      }

      return asyncProps
    }

    getSyncProps = () => {
      let options = this.convertArrayToOptions()
      
      if (this.props.formatOptions) {
        options = this.props.formatOptions(options)
      }

      return { options }
    }

    renderTranslatedSingleValue = ({ children, ...props }) => (
      <components.SingleValue {...props}>
        {this.props.t(children)}
      </components.SingleValue>
    );

    getNoOptionsMessage = () => {
      const {
        loading,
        loadingMessage,
        noOptionsMessage,
        minSearchLength,
        minSearchLengthMessage,
        inputValue,
        resolveToFormValue,
        t,
      } = this.props

      if (loading) {
        return t(loadingMessage || 'loading')
      }

      if (noOptionsMessage && noOptionsMessage.type === 'html') {
        return (
          <div
            dangerouslySetInnerHTML={{ // eslint-disable-line
              __html: resolveToFormValue(noOptionsMessage.value)
            }}
          />
        )
      } else if (minSearchLength && minSearchLength > (inputValue ? inputValue.length : 0)) {
        if (minSearchLengthMessage) {
          return t(minSearchLengthMessage, [minSearchLength - inputValue.length])
        } else {
          return t('typeInMinSearchLengthToStartSearch', [minSearchLength - inputValue.length])
        }
      } else if (noOptionsMessage && resolveToFormValue) {
        return resolveToFormValue(noOptionsMessage)
      } else if (noOptionsMessage) {
        return t(noOptionsMessage);
      }

      return t('noResults')
    }

    getCreateLabel = (input) => {
      let label = this.props.t('create')

      if (this.props.isCreatable && this.props.createLabel) {
        label = this.props.t(this.props.createLabel)
      }

      return `${label} ${input}`
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
                {this.props.t(this.props.loadingMoreMessage || 'loadingMoreResults')}
              </span>
              :
              <span>
                {this.props.t(this.props.loadMoreMessage || 'loadMoreResults')}
              </span>
            }
          </button>
        </div>
      )
    }

    getStyles = () => {
      const { styles, viewTheme: theme } = this.props;

      if (styles) {
        return styles;
      }

      return {
        control: (base, state) => ({
          ...base,
          ...theme.selectize.control,
          ...state.isFocused ? { ...theme.formControl.focus } : {},
          ...state.isDisabled ? { ...theme.formControl.disabled } : { backgroundColor: base.backgroundColor },
        }),
        valueContainer: (base) => ({
          ...base,
          ...theme.selectize.valueContainer,
        }),
        indicatorsContainer: (base) => ({
          ...base,
          ...theme.selectize.indicatorsContainer, 
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
          ref={this.props.selectizeRef}
          isDisabled={this.props.disabled || false}
          value={this.convertObjectToValue()}
          noOptionsMessage={this.getNoOptionsMessage}
          formatCreateLabel={this.getCreateLabel}
          onChange={this.handleChange}
          styles={this.getStyles()}
          components={{
            ...get(this.props, 'components'),
            ...has(this.props, 'components.Control') ?
              { Control: get(this.props, 'components.Control') } :
              { Control: Control },
            ...has(this.props, 'components.MenuList') ?
              { MenuList: get(this.props, 'components.MenuList') } :
              { MenuList: this.renderMenuList },
            ...has(this.props, 'components.Option') ?
              { Option: get(this.props, 'components.Option') } :
              { Option: this.renderOption },
            ...get(this.props, 'translateLabel') ?
              { SingleValue: this.renderTranslatedSingleValue } : null,
          }}
          {...this.props.handleSearchChange ?
            { onInputChange: this.props.handleSearchChange } : null}
        />
      )
    }
  }
}

export default createSelectize
