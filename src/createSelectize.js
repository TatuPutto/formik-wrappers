import React, { PureComponent } from 'react'

/* eslint-disable react/prop-types */
const createSelectize = (WrappedSelectize, async = false) => {
  return class Selectize extends PureComponent {
    createIdNamePair = (option) => {
      const convert = this.props.convert

      if (typeof convert === 'boolean') {
        return {
          id: option.value,
          name: option.label
        }
      } else {
        return {
          [convert.valueSourceProp]: option.value,
          [convert.labelSourceProp]: option.label
        }
      }
    }

    createOption = (object) => {
      const convert = this.props.convert

      if (typeof convert === 'boolean') {
        return {
          value: object.id,
          label: object.name
        }
      } else {
        return {
          value: object[convert.valueSourceProp],
          label: object[convert.labelSourceProp]
        }
      }
    }

    convertObjectToValue = () => {
      const {
        field: { value },
        convert,
        isMulti
      } = this.props

      if (!convert) {
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
        convert
      } = this.props

      if (!convert) {
        return options
      }

      return options.map(this.createOption)
    }

    handleChange = (newValue) => {
      const {
        field: { name },
        form: { setFieldValue },
        convert,
        isMulti,
        customOnChange
      } = this.props

      if (customOnChange) {
        return customOnChange(newValue)
      }

      if (!convert) {
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

    getLoadUrl = () => {
      const { dataSource, loadUrl } = this.props

      if (loadUrl) {
        return loadUrl
      }

      let url = this.replacePlaceholderWithValue(dataSource.url)

      if (dataSource.params) {
        const queryStr = Object.keys(dataSource.params).reduce((queryStr, paramName, i) => {
          if (i > 0) {
            queryStr += '&'
          }
          queryStr += this.replacePlaceholderWithValue(dataSource.params[paramName])
          return queryStr
        }, '')

        url += `?${queryStr}`
      }
      
      return url
    }

    replacePlaceholderWithValue = (placeholderOrValue) => {
      if (typeof placeholderOrValue !== 'string') {
        return placeholderOrValue
      }

      return placeholderOrValue.replace(/\B\$\w+/, (match) => {
        const fieldName = match.substring(1)
        const formValue = this.props.form.values[fieldName]
        return encodeURIComponent(formValue)
      })
    }

    createCustomOptionLabel = (option, { context }) => {
      if (context === 'menu') {
        return (
          <div key={option.value}>
            <div>{option.label}</div>
            <small>{option.value}</small>
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

    render() {
      return (
        <WrappedSelectize
          {...this.props}
          {...this.getTypeSpecificProps()}
          value={this.convertObjectToValue()}
          formatOptionLabel={this.props.includeValueAsSubLabel ? this.createCustomOptionLabel : null}
          onChange={this.handleChange}
        />
      )
    }
  }
}

export default createSelectize
