// @flow
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import i18next from '../../i18n';
import { Input } from 'reactstrap';
import Select from 'react-select';
import { createUseStyles } from 'react-jss';
import FBCheckbox from '../checkbox/FBCheckbox';
import CardEnumOptions from '../CardEnumOptions';
import { getRandomId } from '../utils';
import type { Node } from 'react';
import type { Parameters, FormInput, Mods } from '../types';

const useStyles = createUseStyles({
  hidden: {
    display: 'none',
  },
});

// specify the inputs required for a string type object
export function CardDefaultParameterInputs({
  parameters,
  onChange,
}: {
  parameters: Parameters,
  onChange: (Parameters) => void,
}): Node {
  return <div />;
}

const getInputCardBodyComponent = ({ type }: { type: string }) =>
  function InputCardBodyComponent({
    parameters,
    onChange,
    mods,
  }: {
    parameters: Parameters,
    onChange: (newParams: Parameters) => void,
    mods: Mods,
  }) {
    const { t } = useTranslation();

    return (
      <React.Fragment>
        <h5>{t('inputDefaultValueLabel')}</h5>
        <Input
          value={parameters.default || ''}
          placeholder={t('inputDefaultValuePlaceholder')}
          type={type}
          onChange={(ev: SyntheticInputEvent<HTMLInputElement>) =>
            onChange({ ...parameters, default: ev.target.value })
          }
          className='card-text'
        />
      </React.Fragment>
    );
  };

function Checkbox({
  mods,
  parameters,
  onChange,
}: {
  mods: Mods,
  parameters: Parameters,
  onChange: (newParams: Parameters) => void,
}) {
  const { t } = useTranslation();
  return (
    <div className='card-boolean'>
      <FBCheckbox
        onChangeValue={() => {
          onChange({
            ...parameters,
            default: parameters.default ? parameters.default !== true : true,
          });
        }}
        isChecked={parameters.default ? parameters.default === true : false}
        label={t('inputDefaultCheckboxLabel')}
      />
    </div>
  );
}

function MultipleChoice({
  parameters,
  onChange,
  mods,
}: {
  parameters: Parameters,
  onChange: (newParams: Parameters) => void,
  mods: Mods,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const enumArray = Array.isArray(parameters.enum) ? parameters.enum : [];
  // eslint-disable-next-line no-restricted-globals
  const containsUnparsableString = enumArray.some((val) => isNaN(val));
  const containsString =
    containsUnparsableString ||
    enumArray.some((val) => typeof val === 'string');
  const [isNumber, setIsNumber] = React.useState(
    !!enumArray.length && !containsString,
  );
  const [elementId] = React.useState(getRandomId());

  return (
    <div className='card-enum'>
      <h3>{t('dropdownPossibleValuesLabel')}</h3>
      <FBCheckbox
        onChangeValue={() => {
          if (Array.isArray(parameters.enumNames)) {
            // remove the enumNames
            onChange({
              ...parameters,
              enumNames: null,
            });
          } else {
            // create enumNames as a copy of enum values
            onChange({
              ...parameters,
              enumNames: enumArray.map((val) => `${val}`),
            });
          }
        }}
        isChecked={Array.isArray(parameters.enumNames)}
        label={t('dropdownPossibleValuesDescriptionLabel')}
        id={`${elementId}_different`}
      />
      <div
        className={
          containsUnparsableString || !enumArray.length ? classes.hidden : ''
        }
      >
        <FBCheckbox
          onChangeValue={() => {
            if (containsString || !isNumber) {
              // attempt converting enum values into numbers
              try {
                const newEnum = enumArray.map((val) => {
                  let newNum = 0;
                  if (val) newNum = parseFloat(val) || 0;
                  if (Number.isNaN(newNum))
                    throw new Error(`Could not convert ${val}`);
                  return newNum;
                });
                setIsNumber(true);
                onChange({
                  ...parameters,
                  enum: newEnum,
                });
              } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
              }
            } else {
              // convert enum values back into strings
              const newEnum = enumArray.map((val) => `${val || 0}`);
              setIsNumber(false);
              onChange({
                ...parameters,
                enum: newEnum,
              });
            }
          }}
          isChecked={isNumber}
          disabled={containsUnparsableString}
          label={t('dropdownForceNumberDescriptionLabel')}
          id={`${elementId}_forceNumber`}
        />
      </div>
      <CardEnumOptions
        mods={mods}
        initialValues={enumArray}
        names={
          Array.isArray(parameters.enumNames)
            ? parameters.enumNames.map((val) => `${val}`)
            : undefined
        }
        showNames={Array.isArray(parameters.enumNames)}
        onChange={(newEnum: Array<string>, newEnumNames?: Array<string>) =>
          onChange({
            ...parameters,
            enum: newEnum,
            enumNames: newEnumNames,
          })
        }
        type={isNumber ? 'number' : 'string'}
      />
    </div>
  );
}

const defaultInputs: { [string]: FormInput } = {
  dateTime: {
    displayName: i18next.t('dateTime'),
    matchIf: [
      {
        types: ['string'],
        format: 'date-time',
      },
    ],
    defaultDataSchema: {
      format: 'date-time',
    },
    defaultUiSchema: {},
    type: 'string',
    cardBody: getInputCardBodyComponent({ type: 'datetime-local' }),
    modalBody: CardDefaultParameterInputs,
  },
  date: {
    displayName: i18next.t('date'),
    matchIf: [
      {
        types: ['string'],
        format: 'date',
      },
    ],
    defaultDataSchema: {
      format: 'date',
    },
    defaultUiSchema: {},
    type: 'string',
    cardBody: getInputCardBodyComponent({ type: 'date' }),
    modalBody: CardDefaultParameterInputs,
  },
  time: {
    displayName: i18next.t('time'),
    matchIf: [
      {
        types: ['string'],
        format: 'time',
      },
    ],
    defaultDataSchema: {
      format: 'time',
    },
    defaultUiSchema: {},
    type: 'string',
    cardBody: getInputCardBodyComponent({ type: 'time' }),
    modalBody: CardDefaultParameterInputs,
  },
  checkbox: {
    displayName: i18next.t('checkBox'),
    matchIf: [
      {
        types: ['boolean'],
      },
    ],
    defaultDataSchema: {},
    defaultUiSchema: {},
    type: 'boolean',
    cardBody: Checkbox,
    modalBody: CardDefaultParameterInputs,
  },
  radio: {
    displayName: i18next.t('radio'),
    matchIf: [
      {
        types: ['string', 'number', 'integer', 'array', 'boolean', 'null'],
        widget: 'radio',
        enum: true,
      },
    ],
    defaultDataSchema: { enum: [] },
    defaultUiSchema: {
      'ui:widget': 'radio',
    },
    type: 'string',
    cardBody: MultipleChoice,
    modalBody: CardDefaultParameterInputs,
  },
  dropdown: {
    displayName: i18next.t('dropDown'),
    matchIf: [
      {
        types: ['string', 'number', 'integer', 'array', 'boolean', 'null'],
        enum: true,
      },
    ],
    defaultDataSchema: { enum: [] },
    defaultUiSchema: {},
    type: 'string',
    cardBody: MultipleChoice,
    modalBody: CardDefaultParameterInputs,
  },
};

export default defaultInputs;
