import React, { PureComponent, Fragment } from 'react'
import { array, bool, object, oneOfType, number, string } from 'prop-types'
import { Field, getIn } from 'formik'
import Collapse from 'react-smooth-collapse'

import classnames from 'classnames'


class FieldArray extends PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      expanded: props.initiallyExpandedItem ? [props.initiallyExpandedItem] : []
    }
  }

  // componentDidMount() {
  //   if (!Array.isArray(this.getRows()) || this.props.initializeWithEmptyRow) {
  //     this.props.push(this.initializeNewRow());
  //   }
  // }

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

    //
    // if (childElConfig.hasOwnProperty('model')) {
    //   const fullyQualifiedFieldName = `${name}.${index}.${elConfig.model}`
    //   return this.props.renderField(fullyQualifiedFieldName, childElConfig)
    // } else {
    //   const fullyQualifiedFieldName = `${name}.${index}`
    //   return this.props.renderField(fullyQualifiedFieldName, childElConfig)
    // }

    // console.log('@Mapping child elements', children);


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
        // return this.props.renderField(fullyQualifiedFieldName, childElConfig)
      } else if (childElConfig.hasOwnProperty('name')) {
          fullyQualifiedFieldName = `${name}.${index}.${childElConfig.name}`
          // return this.props.renderField(fullyQualifiedFieldName, childElConfig)
      } else {
        fullyQualifiedFieldName = `${name}.${index}`
      }

      const Element = this.props.renderField(fullyQualifiedFieldName, childElConfig)
      // console.log('ELEMENT', Element)

      // return Element

      if (childElConfig.hasOwnProperty('children')) {
        return (
          React.cloneElement(
            Element,
            {},
            this.renderFields(index, childElConfig.children)
          )
          // <Element>
          //   {this.renderFields(index, childElConfig.children)}
          // </Element>
        )
      } else {
        return Element
      }

      // const fullyQualifiedFieldName = `${name}.${index}.${childElConfig.model}`
      // return this.props.renderField(fullyQualifiedFieldName, childElConfig)

    })

    // return order.map((fieldName) => {
    //   const fieldConfig = shape[fieldName]
    //   const fullyQualifiedFieldName = `${name}.${index}.${fieldName}`
    //
    //   return this.props.renderField(fullyQualifiedFieldName, fieldConfig)
    //
    //
    //   // return (
    //   //   <Field
    //   //     key={fullyQualifiedFieldName}
    //   //     name={fullyQualifiedFieldName}
    //   //     elConfig={fieldConfig}
    //   //     fieldComponent={fieldComponent}
    //   //     component={fieldWrapperComponent}
    //   //   />
    //   // )
    // })
  }

  initializeNewRow = () => {
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

  renderRow = (contact, index) => {

    const {
      form: { values },
      name,
      push,
      controlled = true,

      newRowForEachItem = true,

    } = this.props

    return (
      <Fragment>
        {newRowForEachItem ?
          <div className="row">
            {this.renderFields(index, this.props.shape)}
          </div>
          :
          <Fragment>
            {this.renderFields(index, this.props.shape)}
          </Fragment>
        }
      </Fragment>

    )

    // return (
    //   <div key={index}>
    //     <div className={controlled && canRemoveRow ? "row" : ""}>
    //       <div className={controlled && canRemoveRow ? "col-11" : ""}>
    //
    //         <div className={classnames({ 'row': newRowForEachItem })}>
    //           {this.renderFields(index, this.props.shape)}
    //         </div>
    //
    //       </div>
    //
    //       {controlled &&
    //         <Fragment>
    //           <div className={controlled && canRemoveRow ? "col-1" : ""}>
    //
    //             <label className="d-block invisible">
    //               -
    //             </label>
    //             {canRemoveRow &&
    //               <button
    //                 type="button"
    //                 className="btn btn-outline-secondary"
    //                 onClick={() => this.removeItem(index)} // remove a friend from the list
    //               >
    //                 <span className="fas fa-trash-alt" />
    //               </button>
    //             }
    //           </div>
    //
    //         {index === values[name].length - 1 &&
    //           <button
    //             type="button"
    //             className="btn btn-link"
    //             onClick={() => push(this.initializeNewRow())}
    //           >
    //             <span className="fas fa-plus mr-1" />
    //             Add new entry
    //           </button>
    //         }
    //
    //         </Fragment>
    //       }
    //
    //
    //     </div>
    //
    //
    //   </div>
    // )
  }

  render() {
    const {
      form: { values },
      name,
      remove,
      insert,
      push,
      controlled = true,
      accordion = false,
      itemIdProp = 'id',
      itemLabelProp,
      noResultsMessage = 'Ei tuloksia',
    } = this.props

    const items = getIn(values, name)
    const hasItems = items && items.length > 0

    return (
      <Fragment>
        {accordion &&
          <div className="accordion">
            {hasItems && items.map((item, i) => {
              const isExpanded = this.state.expanded.includes(item[itemIdProp].toString())

              return (
                <div className="card" key={i} id={item[itemIdProp]}>
                  <div className="card-header" onClick={() => this.expandItem(item[itemIdProp].toString())}>
                    <span
                      className={classnames('fas fa-fw mr-1', {
                        'fa-chevron-down': isExpanded,
                        'fa-chevron-right': !isExpanded,
                      })}
                    />
                    {itemLabelProp && item[itemLabelProp]}
                  </div>
                  <Collapse expanded={isExpanded}>
                    <div className="card-body">
                      {this.renderRow(item, i)}
                    </div>
                  </Collapse>
                </div>
              )

            })}
          </div>
        }
        {!accordion && hasItems && items.map((employee, i) => (
          this.renderRow(employee, i)
        ))}
        {!hasItems &&
          <div className="text-muted text-center" style={{ padding: '2rem' }}>
            {noResultsMessage}
          </div>
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
