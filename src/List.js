import React, { PureComponent, Fragment } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import { get } from 'lodash'


class List extends PureComponent {

  renderActions = (item, actions) => {
    return actions.map((action) => (
      <button
        key={action.text}
        className={classnames('btn', {
          [`btn-${action.size}`]: action.size,
          [`btn-${action.color}`]: action.color
        })}
        onClick={() => this.handleActionButtonClick(item, action)}
      >
        <span className={classnames('fas', `fa-${action.icon}`)} />
        &nbsp;
        {action.text}
      </button>
    ))
  }

  handleActionButtonClick = (item, action) => {
    if (action.role === 'link') {
      this.props.go(this.resolveString(item, action.to));
    }
  }

  resolveString = (item, str) => {
    return str.replace(/\$[\w.]+/g, (match) => {

      return item[match.substring(1)]

    });
  }

  resolveToValue = (item, sourceKeyOrArrayOfKeys) => {
    if (typeof sourceKeyOrArrayOfKeys === 'object') {
      return sourceKeyOrArrayOfKeys.map((key) => item[key]).join(' ')
    } else {
      return item[sourceKeyOrArrayOfKeys]
    }
  }

  renderItem = (item, renderSchema) => {

    return renderSchema.map((part, i) => {

      const Component = part.component
      // const value = part.hasOwnProperty('source') ?
      //   this.resolveToValue(item, part.source) :

      const value = part.source ?
        this.resolveToValue(item, part.source) :
          part.value ?
            this.resolveString(item, part.value) :
              null


      // {
      //   component: 'div',
      //   source: 'name'
      // }
      return (
        <Component
          {...part.hasOwnProperty('attributes') ? { ...part.attributes } : null}
          key={i}
          className={classnames({
            [part.class]: part.hasOwnProperty('class')
          })}
        >
          {value}
          {part.hasOwnProperty('children') && this.renderItem(item, part.children)}
          {part.hasOwnProperty('actions') &&
            <div>
              {this.renderActions(item, part.actions)}
            </div>
          }
        </Component>
      )


    })

  }

  mapDataToSchema = (schema, path) => {
    console.log('SCHEMA', schema)
    // const data = [
    //   {
    //     id: 87,
    //     name: 'Takamäki Yhtiöt Ky',
    //     permits: [
    //       {
    //         "id": "ec04b5e8-face-4731-9f7f-9150c98be8e8",
    //         "assignment": "Plasmansyöttötunnelin korjaus",
    //         "safetyLockings": "{\"mechanicalLocking\":{\"inUse\":true,\"lockId\":1,\"personInCharge\":\"werewr\",\"name\":\"mechanicalLocking\",\"lockingNumber\":\"213123\",\"locked\":true,\"lockedDate\":\"2019-07-01\",\"markedLockedByUser\":\"Takamäki, Support\"}}",
    //         "siteId": "19729149",
    //         "contractorId": 87,
    //         "creatorCompanyId": 87,
    //         "contractorBusinessId": "0861964-1",
    //         "contractorName": "Takamäki yhtiöt Ky",
    //         "permitOwnerId": 83446,
    //         "permitOwnerFirstName": "Kaarlo",
    //         "permitOwnerLastName": "Vakkilainen",
    //         "allLockingsUnlocked": false,
    //         "startDate": "01.07.2019",
    //         "endDate": "01.07.2019",
    //         "nSafetyLockings": 1
    //       },
    //       {
    //         "id": "f38567d8-e679-46e6-b843-6ab29ec40d6e",
    //         "assignment": "Test",
    //         "safetyLockings": "{\"mechanicalLocking\":{\"inUse\":true,\"lockId\":1,\"personInCharge\":\"Vastuu henkilö 1\",\"name\":\"mechanicalLocking\",\"lockingNumber\":\"23434\",\"locked\":true,\"lockedDate\":\"2019-07-01\",\"markedLockedByUser\":\"Takamäki, Support\"}}",
    //         "siteId": "19729149",
    //         "contractorId": 87,
    //         "creatorCompanyId": 87,
    //         "contractorBusinessId": "0861964-1",
    //         "contractorName": "Takamäki yhtiöt Ky",
    //         "permitOwnerId": 83446,
    //         "permitOwnerFirstName": "Kaarlo",
    //         "permitOwnerLastName": "Vakkilainen",
    //         "allLockingsUnlocked": false,
    //         "startDate": "01.07.2019",
    //         "endDate": "27.07.2019",
    //         "nSafetyLockings": 1
    //       }
    //     ]
    //   }
    // ]

    const _that = this;

    function getDataAtPath() {
      path = `${path}.${schema.source}`
      console.log('path: ', path);
      return get(_that.props.data, path)
    }

    console.log('schema.source: ', schema.source);
    const items = schema.hasOwnProperty('source') ? getDataAtPath() : this.props.data
    console.log('ITEMS', items)

    return items.map((item, i) => {

      return (
        <div key={item[schema.key]}>

          <div>
            {this.renderItem(item, schema.render)}

            {schema.children && this.mapDataToSchema(schema.children, path ? path : i)}
          </div>

        </div>
      )

    })
  }


  render() {
    // const {
    //   form: { values },
    //   name,
    //   remove,
    //   insert,
    //   push,
    //   controlled = true,
    // } = this.props

    console.log('@List props', this.props);

    return (
      <div>{this.mapDataToSchema(this.props.schema)}</div>
    )
  }
}

List.propTypes = {
  field: PropTypes.object.isRequired,
  actions: PropTypes.array
  // children: oneOfType([object, string]),
  // fieldComponent: object.isRequired,
  // shape: array.isRequired,
}

export default List
