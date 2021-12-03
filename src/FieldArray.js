import React, { PureComponent, Fragment } from 'react'
import { array, object, oneOfType, string } from 'prop-types'
import {  getIn } from 'formik'
import Collapse from 'react-smooth-collapse'
import classnames from 'classnames'

class FieldArray extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      expanded: props.initiallyExpandedItem ? [props.initiallyExpandedItem] : []
    }
  }

  expandItem = (i) => {
    const isExpanded = this.state.expanded.includes(i)

    if (isExpanded) {
      this.setState({
        expanded: this.state.expanded.filter((expandedItemIndex) => expandedItemIndex !== i)
      })
    } else {
      this.setState({
        expanded: this.state.expanded.concat(i)
      })
    }
  }

  getRows = () => {
    return this.props.form.values[this.props.name]
  }

  getAmountOfRows = () => {
    return this.getRows().length
  }

  renderFields = (index, children) => {
    const {
      name,
      fieldComponent,
      fieldWrapperComponent,
      order,
      shape
    } = this.props

    return children.map((childElConfig) => {

      let fullyQualifiedFieldName

      if (childElConfig.hasOwnProperty('baseNameOverride')) {
        if (childElConfig.hasOwnProperty('model')) {
          fullyQualifiedFieldName = `${childElConfig.baseNameOverride}.${index}.${childElConfig.model}`
        } else if (childElConfig.hasOwnProperty('name')) {
          fullyQualifiedFieldName = `${childElConfig.baseNameOverride}.${index}.${childElConfig.name}`
        } else {
          fullyQualifiedFieldName = `${childElConfig.baseNameOverride}.${index}`
        }
      } else if (childElConfig.hasOwnProperty('model')) {
        fullyQualifiedFieldName = `${name}.${index}.${childElConfig.model}`
      } else if (childElConfig.hasOwnProperty('name')) {
          fullyQualifiedFieldName = `${name}.${index}.${childElConfig.name}`
      } else {
        fullyQualifiedFieldName = `${name}.${index}`
      }

      const Element = this.props.renderField(fullyQualifiedFieldName, childElConfig)

      if (childElConfig.hasOwnProperty('children')) {
        return (
          React.cloneElement(
            Element,
            {},
            this.renderFields(index, childElConfig.children)
          )
        )
      } else {
        return Element
      }
    })
  }

  initializeNewRow = (force = false) => {
    const { order, initialValues } = this.props;

    return order.reduce((row, fieldName) => {
      if (initialValues && initialValues.hasOwnProperty(fieldName)) {
        row[fieldName] = initialValues[fieldName]
        return row
      } else {
        row[fieldName] = ''
        return row
      }
    }, {})
  }

  removeItem = (index) => {
    if (this.getAmountOfRows() === 1) {
      this.props.remove(index)
      this.props.insert(index, this.initializeNewRow())
    } else {
      this.props.remove(index)
    }
  }

  canRemoveRow = (index) => {
    if (this.getAmountOfRows() === 1 && this.isEmptyRow(index)) {
      return false
    } else {
      return true
    }
  }

  isEmptyRow = (index) => {
    const rows = this.getRows()
    return Object.values(rows[index]).every((value) => !value)
  }

  renderRowRemoveButton = (index) => {
    const style = this.props.removeButtonAsFooter ?
      { border: 'none' } : { height: '34px' }
    return (
      <button
        type="button"
        className="btn btn-outline-danger ml-1"
        style={style}
        onClick={() => this.removeItem(index)}
      >
        <span className="far fa-trash-alt" />
        {this.props.removeLabel &&
          ` ${this.props.removeLabel}`
        }
      </button>
    );
  }

  renderRow = (item, index) => {
    const {
      form: { values },
      name,
      push,
      controlled = true,
      rowElement: RowElement,
      newRowForEachItem = true,
      removable = false,
      removeButtonAsFooter = false,
    } = this.props

    const shouldRenderRemoveButton = removable && !removeButtonAsFooter;

    return (
      <Fragment>
        {newRowForEachItem && RowElement ?
          <RowElement>
            {this.renderFields(index, this.props.shape)}
            {shouldRenderRemoveButton && this.renderRowRemoveButton(index)}
          </RowElement>
          : newRowForEachItem ?
            <div className="row">
              {this.renderFields(index, this.props.shape)}
              {shouldRenderRemoveButton && this.rend(index)}
            </div>
            :
            <Fragment>
              {this.renderFields(index, this.props.shape)}
              {shouldRenderRemoveButton && this.renderRowRemoveButton(index)}
            </Fragment>
        }
      </Fragment>
    )
  }

  render() {
    const {
      form: { values },
      name,
      remove,
      insert,
      push,
      controlled = true,
      creatable = false,
      accordion = false,
      itemIdProp = 'id',
      itemLabelProp,
      initializeIfEmpty,
      noResultsMessage = 'noResults',
      createLabel = 'addNewEntry',
      header,
      renderHeader,
      displayDivider,
      children,
      removable = false,
      removeButtonAsFooter = false,
    } = this.props

    const items = getIn(values, name)
    const hasItems = items && items.length > 0

    if (initializeIfEmpty) {
      push({})
    }

    return (
      <Fragment>
        {accordion &&
          <div className="accordion">
            {hasItems && items.map((item, i) => {
              const isExpanded = this.state.expanded.includes(item[itemIdProp].toString())

              return (
                <div
                  key={i}
                  id={item[itemIdProp]}
                  className={classnames('card', this.props.wrapperClass)}
                >
                  <div
                    className={
                      classnames(
                        'card-header d-flex align-items-center clickable',
                        this.props.headerClass 
                      )
                    }
                    onClick={() => this.expandItem(item[itemIdProp].toString())}
                  >
                    <span
                      className={classnames('fas fa-fw mr-1 d-print-none', {
                        'fa-chevron-down': isExpanded,
                        'fa-chevron-right': !isExpanded,
                      })}
                    />
                    {header && renderHeader(`${name}.${i}`, item)}
                    {!header && itemLabelProp && item[itemLabelProp]}
                  </div>
                  <Collapse expanded={isExpanded}>
                    <div>
                      {this.renderRow(item, i)}
                    </div>
                  </Collapse>
                </div>
              )

            })}
          </div>
        }
        {!accordion && hasItems && items.map((item, i, arr) => {
          if (displayDivider && i > 0) {
            return (
              <Fragment key={i}>
                <hr />
                {this.renderRow(item, i)}
                <div
                  className={classnames('d-flex', {
                    'justify-content-between': creatable && i === arr.length - 1,
                    'justify-content-end': !creatable || i !== arr.length - 1,
                  })}
                >
                  {creatable && i === arr.length - 1 &&
                    <button
                      type="button"
                      className="btn btn-link"
                      onClick={() => push({})}
                    >
                      <span className="fas fa-plus mr-1" />
                      {createLabel}
                    </button>
                  }
                  {removable && removeButtonAsFooter &&
                    this.renderRowRemoveButton(i)
                  }
                </div>
              </Fragment>
            )
          }
          return (
            <Fragment key={i}>
              {this.renderRow(item, i)}
              <div
                className={classnames('d-flex', {
                  'justify-content-between': creatable && i === arr.length - 1,
                  'justify-content-end': !creatable || i !== arr.length - 1,
                })}
              >
                {creatable && i === arr.length - 1 &&
                  <button
                    type="button"
                    className="btn btn-link"
                    onClick={() => push({})}
                  >
                    <span className="fas fa-plus mr-1" />
                    {createLabel}
                  </button>
                }
                {removable && removeButtonAsFooter &&
                  this.renderRowRemoveButton(i)
                }
              </div>
            </Fragment>
          )
        })}
        {!hasItems &&
          <div className="text-muted text-center" style={{ padding: '2rem' }}>
            {noResultsMessage}
          </div>
        }
        {creatable && (accordion || !accordion && !hasItems) &&
          <button
            type="button"
            className="btn btn-link"
            onClick={() => push({})}
          >
            <span className="fas fa-plus mr-1" />
            {createLabel}
          </button>
        }
      </Fragment>
    )
  }
}

FieldArray.propTypes = {
  field: object.isRequired,
  children: oneOfType([object, string]),
  fieldComponent: object.isRequired,
  shape: array.isRequired,
}

export default FieldArray
