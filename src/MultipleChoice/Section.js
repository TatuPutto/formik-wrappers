import React from 'react'
import { array, bool, string } from 'prop-types'


const Section = (props) => {
  const colSpan = props.options.length

  const labelTd = (
    <td className="align-middle py-2">
      <span className={props.nested ? "ml-3" : null}>
        <i>
          {props.label}
        </i>
      </span>
    </td>
  )

  if (props.alignOptionsLeft) {
    return (
      <tr>
        <td colSpan={colSpan} />
        {labelTd}
      </tr>
    )
  } else {
    return (
      <tr>
        {labelTd}
        <td colSpan={colSpan} />
      </tr>
    )
  }
}

Section.defaultProps = {
  alignOptionsLeft: false,
  nested: false,
}

Section.propTypes = {
  options: array.isRequired,
  label: string.isRequired,
  alignOptionsLeft: bool,
  nested: bool,
}

export default Section
