import React, { PureComponent } from 'react'
import { components } from 'react-select'
import { get, set } from 'lodash'

/* eslint-disable react/prop-types */
const createSelectize = (WrappedSelectize, async = false) => {
  return class Selectize extends PureComponent {
    createIdNamePair = (option) => {
      const {
        convert,
        convertFromString,
        // convertOutput
      } = this.props

      // if (convertOutput) {
      //   const output = convertOutput.reduce((outputObj, propNameOrConfig) => {
      //
      //     if (typeof propNameOrConfig === 'object' && propNameOrConfig.hasOwnProperty('path')) {
      //       outputObj[propNameOrConfig.as] = get(option, propNameOrConfig.path)
      //     } else if (typeof propNameOrConfig === 'object' && propNameOrConfig.hasOwnProperty('value')) {
      //       outputObj[propNameOrConfig.as] = propNameOrConfig.value
      //     } else {
      //       outputObj[propNameOrConfig] = get(option, propNameOrConfig)
      //     }
      //
      //     return outputObj
      //
      //   }, {})
      //
      //   return output
      // }

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
          isDisabled: this.shouldDisable()
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

      set(option, 'isDisabled', this.shouldDisable())

      if (includedProps) {
        includedProps.forEach((propNameOrConfig) => {

          if (typeof propNameOrConfig === 'object') {
            option[propNameOrConfig.as] = get(baseValue, propNameOrConfig.path)
          } else {
            option[propNameOrConfig] = get(baseValue, propNameOrConfig)
          }

        })
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

      localStorage.setItem(`${this.props.storageId}_valueChanged`, true);

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

    loadOptionsFromUrl = () => {
      return fetch(this.getLoadUrl())
        .then(response => response.json())
        .then(items => items.map(this.createOption))
    }

    // getLoadUrl = () => {}

    getLoadUrl = () => {

      const { loadUrl, dataSource } = this.props

      if (loadUrl) {
        return loadUrl
      }

      let url = dataSource.url
      let resolvedUrl = dataSource.url;

      if (url.includes('$') && !url) {
        console.error('DataSource URL has dynamic path parameters but none are defined');
        throw '';
      }

      if (url.includes('$')) {
        resolvedUrl = this.resolvePathParams(resolvedUrl, dataSource.pathParams);
      }

      if (dataSource.queryParams) {
        resolvedUrl += this.resolveQueryString(dataSource.queryParams);
      }

      return resolvedUrl;

    }

    resolveQueryString = (queryParams) => {

      return Object.keys(queryParams).reduce((queryStr, paramName) => {

        const paramValueOrPathToValue = queryParams[paramName];

        let paramValue = paramValueOrPathToValue;

        if (paramValueOrPathToValue.charAt(0) === '$') {
          paramValue = this.resolveParamValue(paramValueOrPathToValue);
        }

        if (!queryStr.length) {
          return `?${paramName}=${paramValue}`;
        } else {
          return `&${paramName}=${paramValue}`;
        }

      }, '');

    }

    resolvePathParams = (url, pathParams) => {

      return url.replace(/\$[\w/]+/g, (match) => {

        const paramName = match.substring(1);
        const pathToValue = pathParams[paramName].substring(1);

        return this.resolveParamValue(pathToValue);

      });

    }

    resolveParamValue = (pathToValue) => {
      console.log('@resolveParamValue ', pathToValue);
      if (pathToValue.includes('meta')) {
        console.log('this.props.form.values', this.props.form.values);
        return get(this.props.form.values, pathToValue);
      } else {
        return get(this.props.form.values, pathToValue);
      }

    }

    replacePlaceholderWithValue = (placeholderOrValue) => {
      // console.log('PLACEHOLDERORVALUE', placeholderOrValue)
      if (typeof placeholderOrValue !== 'string') {
        return placeholderOrValue
      }

      // const pathParts = placeholderOrValue.split('.')
      //
      // if (pathParts.length > 1) {
      //   let formValue = this.createPathToFormValue(this.props.form.values, pathParts)
      //   return encodeURIComponent(formValue)
      // }
      //
      // return this.props.form.values[pathParts[0]]



      // return placeholderOrValue.replace(/\B\$\w+/, (match) => {
      // return placeholderOrValue.replace(/\B\$^\s/, (match) => {
      return placeholderOrValue.replace(/$(\S+)/, (match) => {
        console.log('MATCH', match)

        const placeholder = match.substring(1)
        const pathParts = placeholder.split('.')
        console.log('PATHPARTS', pathParts)
        let formValue

        // if (pathparts.length === 1) {
        //   formValue = this.props.form.values[pathparts[0]]
        // } else {
        //   formValue = this.props.form.values[...pathparts]
        // }

        formValue = this.createPathToFormValue(this.props.form.values, pathParts)
        console.log('@createSElectize FORMVALUE', formValue)


        return encodeURIComponent(formValue)
      })
    }
                                  //   ['serviceProvider', 'businessId']

    createPathToFormValue = (value, pathParts) => {
      if (pathParts.length > 1) {
        return this.createPathToFormValue(value[pathParts[0]], pathParts.slice(1))
      } else {
        return value[pathParts[0]]
      }
    }

    renderOptionLabel = () => {
      if (this.props.includeValueAsSubLabel || this.props.sublabelProp) {
        return this.createCustomOptionLabel
      }
      // (this.props.includeValueAsSubLabel || this.props.sublabelProp) ? this.createCustomOptionLabel : null
    }

    createCustomOptionLabel = (option, { context }) => {
      const { disabledOptionAlert, includeValueAsSubLabel } = this.props

      if (context === 'menu') {
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
            {disabledOptionAlert &&
              <div className={`text-${disabledOptionAlert.color}`}>
                <span className={`fas fa-${disabledOptionAlert.icon || 'exclamation-triangle'} mr-1`} />
                {disabledOptionAlert.text}
              </div>
            }
          </div>
        )
      } else {
        return (
          <div key={option.value}>
            <div>{option.label}</div>
          </div>
        )
      }
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

      if (this.props.loadOptions) {
        asyncProps.loadOptions = this.props.loadOptions
      } else {
        asyncProps.loadOptions = this.loadOptionsFromUrl
      }

      return asyncProps
    }

    getSyncProps = () => {
      return {
        options: this.convertArrayToOptions()
      }
    }

    getNoOptionsMessage = () => {
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

    renderControl = (props) => (
      <components.Control
        {...props}
        className="form-control p-0"
      />
    )

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
          loadOptions={(value) => {
              return this.props.loadOptions(value)
                .then(items => items.map(this.createOption))
          }}
          isDisabled={this.props.disabled || false}
          key={new Date().getTime() + Math.random()}
          value={this.convertObjectToValue()}
          noOptionsMessage={this.getNoOptionsMessage}
          formatOptionLabel={this.renderOptionLabel}
          onChange={this.handleChange}
          onInputChange={this.props.handleSearchChange}
          styles={this.getStyles()}
          components={{
            Control: this.renderControl
          }}
        />
      )
    }
  }
}

export default createSelectize
