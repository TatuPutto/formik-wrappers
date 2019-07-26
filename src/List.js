import React, { PureComponent, Fragment } from 'react'
import { array, bool, object, oneOfType, number, string } from 'prop-types'


class List extends PureComponent {

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
    return this.props.order.reduce((row, fieldName) => {
      row[fieldName] = ''
      return row
    }, {})
  }

  removeItem = (index) => {
    if (this.props.form.values[this.props.name].length === 1) {
      this.props.remove(index)
      this.props.insert(index, this.initializeNewRow())
    } else {
      this.props.remove(index)
    }
  }

  render() {
    const {
      form: { values },
      remove,
      insert,
      push,
      controlled = true,
    } = this.props

    return (
      <div className="form-group">
        {values.contacts && values.contacts.length > 0 &&
          values.contacts.map((contact, index) => {
            return (
              <div key={index}>
                <div  className={controlled ? "row" : ""}>
                  <div className={controlled ? "col-11" : ""}>

                    <div className="row">
                      {this.renderFields(index)}
                    </div>

                  </div>

                  {controlled &&
                    <Fragment>
                      <div className={controlled ? "col-1" : ""}>

                        <label className="d-block invisible">
                          -
                        </label>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => this.removeItem(index)} // remove a friend from the list
                        >
                          <span className="fas fa-trash-alt" />
                        </button>
                      {/*}<button
                          type="button"
                          onClick={() => insert(index, '')} // insert an empty string at a position
                        >
                          +
                        </button>*/}

                      </div>



                    {index === values.contacts.length - 1 &&
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
