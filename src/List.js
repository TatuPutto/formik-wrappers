import React, { PureComponent, Fragment } from 'react'
import { array, bool, object, oneOfType, number, string } from 'prop-types'


class List extends PureComponent {

  componentDidMount() {
    if (!Array.isArray(this.getRows()) || this.props.initializeWithEmptyRow) {
      this.props.push(this.initializeNewRow());
    }
  }

  getRows = () => {
    return this.props.form.values[this.props.name]
  }

  getAmountOfRows = () => {
    return this.getRows().length
  }

  renderFields = (index) => {
    const {
      name,
      fieldComponent: FieldComponent,
      order,
      shape
    } = this.props

    return order.map((fieldName) => {
      const field = shape[fieldName]
      const fullyQualifiedFieldName = `${name}.${index}.${fieldName}`

      return (
        <FieldComponent
          key={fullyQualifiedFieldName}
          config={{ ...field, name: fullyQualifiedFieldName }}
        />
      )
    })
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

  render() {
    const {
      form: { values },
      name,
      remove,
      insert,
      push,
      controlled = true,
    } = this.props

    return (
      <div className="form-group">
        {values[name] && values[name].length > 0 &&
          values[name].map((contact, index) => {
            const canRemoveRow = this.canRemoveRow(index)

            return (
              <div key={index}>
                <div  className={controlled && canRemoveRow ? "row" : ""}>
                  <div className={controlled && canRemoveRow ? "col-11" : ""}>

                    <div className="row">
                      {this.renderFields(index)}
                    </div>

                  </div>

                  {controlled &&
                    <Fragment>
                      <div className={controlled && canRemoveRow ? "col-1" : ""}>

                        <label className="d-block invisible">
                          -
                        </label>
                        {canRemoveRow &&
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => this.removeItem(index)} // remove a friend from the list
                          >
                            <span className="fas fa-trash-alt" />
                          </button>
                        }



                      {/*}<button
                          type="button"
                          onClick={() => insert(index, '')} // insert an empty string at a position
                        >
                          +
                        </button>*/}

                      </div>



                    {index === values[name].length - 1 &&
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() => push(this.initializeNewRow())}
                      >
                        <span className="fas fa-plus mr-1" />
                        Add new entry
                      </button>
                    }

                    </Fragment>
                  }


                </div>


              </div>
            )
          })
        }



      </div>
    )
  }
}

List.propTypes = {
  field: object.isRequired,
  children: oneOfType([object, string]),
  fieldComponent: object.isRequired,
  shape: array.isRequired,
}

export default List
