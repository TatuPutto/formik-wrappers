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

  componentDidMount() {
    this.initializeIfEmpty()
  }

  componentDidUpdate() {
    this.initializeIfEmpty()
  }

  getItems = () => {
    return getIn(this.props.form.values, this.props.name, [])
  }

  hasItems = () => {
    const items = this.getItems()
    return items && items.length > 0
  }

  getAmountOfItems = () => {
    const items = this.getItems()
    return items ? items.length : 0
  }

  initializeIfEmpty = () => {
    if (!this.props.initializeIfEmpty) {
      return
    }

    if (!this.hasItems()) {
      this.props.push(typeof this.props.initializeIfEmpty === 'object' ? this.props.initializeIfEmpty : {})
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

  renderFields = (index, children) => {
    const { name } = this.props

    return children.map((childElConfig, columnIndex) => {

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

      const Element = this.props.renderField(fullyQualifiedFieldName, childElConfig, columnIndex)

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

  initializeNewRow = () => {
    const { order, initialValues } = this.props

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

  canRemoveItem = (index) => {
    if (this.props.initializeIfEmpty) {
      return true
    }

    if (this.getAmountOfItems() === 1 && this.isEmptyItem(index)) {
      return false
    }
    
    return true
  }

  isEmptyItem = (index) => {
    const items = this.getItems()
    return Object.values(items[index]).every(value => !value)
  }

  renderRowRemoveButton = (index) => {
    if (!this.canRemoveItem(index)) {
      return null
    }

    const style = this.props.removeButtonAsFooter ?
      { border: 'none' } : { height: '34px' }

    return (
      <button
        type="button"
        className="btn btn-outline-danger ml-1"
        style={style}
        onClick={() => this.props.remove(index)}
      >
        <span className="far fa-trash-alt" />
        {this.props.removeLabel &&
          ` ${this.props.removeLabel}`
        }
      </button>
    );
  }

  renderRow = (index) => {
    const {
      rowElement: RowElement,
      newRowForEachItem = true,
      removable = false,
      removeButtonAsFooter = false,
    } = this.props

    const shouldRenderRemoveButton = removable && !removeButtonAsFooter
    const rowContent = [
      this.renderFields(index, this.props.shape),
      shouldRenderRemoveButton ? this.renderRowRemoveButton(index) : null,
    ]

    return (
      <Fragment>
        {newRowForEachItem && RowElement ?
          <RowElement>
            {rowContent}
          </RowElement>
          : newRowForEachItem ?
            <div className="row">
              {rowContent}
            </div>
            :
            <Fragment>
              {rowContent}
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
      noResultsMessage = 'noResults',
      createLabel = 'addNewEntry',
      header,
      renderHeader,
      displayDivider,
      children,
      removable = false,
      removeButtonAsFooter = false,
    } = this.props

    const items = this.getItems()
    const hasItems = this.hasItems()

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
                      {this.renderRow(i)}
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
                {this.renderRow(i)}
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
              {this.renderRow(i)}
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
