import React, { PureComponent } from 'react'
import { bool, object, oneOfType, number, string } from 'prop-types'
import classnames from 'classnames'
import { Field, getIn } from 'formik'
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

  renderThead = () => {
    if (this.props.options.some(option => option.label)) {
      return (
        <thead>
          {this.renderHeaders()}
        </thead>
      )
    }
  }

  renderHeaders = () => {

    // Condensed layout does not use headers.
    if (this.props.condenseLayout || this.props.noOptionHeadings) {
      return
    }

    if (this.props.alignOptionsLeft) {
      return (
        <tr>
          {this.renderOptionHeaders()}
          {this.props.heading ?
            <th
              className="no-border pr-0" 
              style={{ borderTop: 'none' }}
            >
              {this.props.heading}
            </th>
            :  
            <th
              className="no-border" 
              style={{ borderTop: 'none' }}
            />
          }
        </tr>
      )
    } else {
      return (
        <tr>
          {this.props.heading ?
            <th
              className="no-border pl-0" 
              style={{ borderTop: 'none' }}
            >
              {this.props.heading}
            </th>
            :  
            <th
              className="no-border" 
              style={{ borderTop: 'none' }}
            />
          }
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
        className="text-center flex-grow-1 no-border"
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
          [this.props.class]: this.props.class,
        })}
      >
        <table
          className={classnames('table', {
            'table-striped': this.props.striped,
            'mb-0': this.props.disableGutter,
          })}
        >
          {this.renderThead()} 
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
  class: '',
}

Form.propTypes = {
  field: object.isRequired,
  checkedValue: oneOfType([bool, string]).isRequired,
  children: oneOfType([object, string]),
  class: string,
  text: string,
  align: string,
  disabled: bool,
  disableMargin: bool,
  id: string,
  size: string,
  tabIndex: number
}

export default Form
