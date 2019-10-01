import React from 'react';
import { bool, func, object, oneOfType, string } from 'prop-types';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import createFieldComponent from './createFieldComponent'
// import { prepareDateForBackend as parseDate } from '../../util/format-date';


const DatePicker = (props) =>  {
  const {
    field: { name },
    form: { setFieldValue },
    alignPopperRight = false,
    className = "form-control",
    disabled = false,
    label,
    maxDate = null,
    minDate = null,
    readOnly = false,
    required = false,
    toolTipText,
    valueDateFormat = "YYYY-MM-DD",
    onChange,
  } = props

  const locale = moment.locale()
  // const isoLocale = moment.locale() === 'se' ? 'sv' : locale

  return (
    <div>
      <div style={{position: "relative"}}>
        <DatePicker
          showMonthDropdown
          showYearDropdown
          fixedHeight
          disabled={disabled}
          readOnly={readOnly}
          locale={locale}
          className={className}
          placeholderText={'DD.MM.YYYY'}
          dateFormat={["DD.MM.YYYY", "D.M.YYYY"]}
          selected={input.value ? moment(input.value, valueDateFormat) : null}
          minDate={minDate ? moment(minDate, "YYYY-MM-DD") : null}
          maxDate={maxDate ? moment(maxDate, "YYYY-MM-DD") : null}
          popperPlacement={alignPopperRight ? "bottom-end" : "bottom-start"}
          popperClassName={alignPopperRight ? "react-datepicker-popper-align-right" : null}
          onFocus={() => input.onFocus()}
          onBlur={() => input.onBlur()}
          onChange={(date) => {
            if (onChange) return onChange(date);
            input.onChange(parseDate(date));
            input.onBlur();
          }}
        />
        {input.value && !disabled &&
          <button
            type="button"
            className="btn btn-link"
            tabIndex={-1}
            style={{
              position: "absolute",
              top: className.indexOf("lg") === -1 ? "0.4rem" : "0.55rem",
              right: "0.2rem",
              zIndex: 10,
              padding: "4px",
              fontSize: "0.7rem",
              color: "#5b5b5b"
            }}
            onClick={() => input.onChange(null)}
          >
            <span className="fas fa-times" />
          </button>
        }
      </div>
    </div>
  )
}

DatePicker.propTypes = {
  input: object.isRequired,
  meta: object.isRequired,
  alignPopperRight: bool,
  className: string,
  disabled: bool,
  displayErrorMessage: bool,
  label: string,
  maxDate: oneOfType([/*momentObj, */string, object]),
  minDate: oneOfType([/*momentObj,*/ string]),
  onChange: func,
  placeholder: string,
  readOnly: bool,
  required: bool,
  toolTipText: string,
  valueDateFormat: string
}

export default createFieldComponent(DatePicker)
