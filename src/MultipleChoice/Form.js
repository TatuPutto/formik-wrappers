import React, { PureComponent } from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'
import { Field } from 'formik'
import OptionControl from './OptionControl'


class Form extends PureComponent {
  // <th style={{ borderTop: 'none' }} />
  // renderHeaders = () => {
  //   if (this.props.alignOptionsLeft) {
  //     return (
  //       <tr>
  //         {this.renderOptionHeaders()}
  //         <th style={{ borderTop: 'none' }} />
  //       </tr>
  //     )
  //   } else {
  //     return (
  //       <tr>
  //         <th style={{ borderTop: 'none' }} />
  //         {this.renderOptionHeaders()}
  //       </tr>
  //     )
  //   }
  // }

  renderHeaders = () => {

    // Condensed layout does not use headers.
    if (this.props.condenseLayout) {
      return
      // return (
      //   <div className="d-flex flex-row justify-content-between">
      //     {this.renderOptionHeaders()}
      //   </div>
      // )
    }

    if (this.props.alignOptionsLeft) {
      return (
        <tr>
          {this.renderOptionHeaders()}
          <th style={{ borderTop: 'none' }} />
        </tr>
      )
    } else {
      return (
        <tr>
          <th style={{ borderTop: 'none' }} />
          {this.renderOptionHeaders()}
        </tr>
      )
    }
  }

  // renderOptionHeaders = () => {
  //   return this.props.options.map((option, i) => (
  //     <th
  //       key={i}
  //       className="text-center"
  //       style={{
  //         width: this.props.optionColumnWidth,
  //         borderTop: 'none',
  //       }}
  //     >
  //       <div
  //         dangerouslySetInnerHTML={{ __html: option.label }} // eslint-disable-line
  //       />
  //     </th>
  //   ))
  // }

  renderOptionHeaders = () => {
    return this.props.options.map((option, i) => (
      <th
        key={i}
        className="text-center flex-grow-1"
        style={{
          width: this.props.optionColumnWidth,
          borderTop: 'none',
        }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: option.label }} // eslint-disable-line
        />
      </th>
    ))
  }

  renderOptions = (fieldName) => {
    if (this.props.renderOptions) {
      return this.props.renderOptions(fieldName)
    } else {
      return this.props.options.map((option) => (
        <Field
          key={option.label}
          name={fieldName}
          option={option}
          condenseLayout={this.props.condenseLayout}
          component={OptionControl}
        />
      ))
    }
  }

  render() {
    if (this.props.condenseLayout) {
      return (
        <div>
          {React.Children.map(this.props.children, (child) => (
            React.cloneElement(child, {
              condenseLayout: this.props.condenseLayout,
              renderOptions: this.renderOptions,
            })
          ))}
        </div>
      )
    }

    return (
      <div
        className={classnames('multiple-choice', {
          'align-options-left': this.props.alignOptionsLeft,
        })}
      >
        <table
          className={classnames('table', {
            'table-striped': this.props.striped,
            'mb-0': this.props.disableGutter,
          })}
        >
          <thead>
            {this.renderHeaders()}
          </thead>
          <tbody>
            {React.Children.map(this.props.children, (child) => (
              React.cloneElement(child, {
                condenseLayout: this.props.condenseLayout,
                renderOptions: this.renderOptions,
              })
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}

Form.defaultProps = {
  id: null,
  disabled: false,
  disableMargin: false,
  striped: true,
  tabIndex: null,
  optionColumnWidth: '15%',
}

Form.propTypes = {
  field: object.isRequired,
  checkedValue: oneOfType([bool, string]).isRequired,
  children: oneOfType([object, string]),
  text: string,
  align: string,
  disabled: bool,
  disableMargin: bool,
  id: string,
  size: string,
  tabIndex: number
}

export default Form
