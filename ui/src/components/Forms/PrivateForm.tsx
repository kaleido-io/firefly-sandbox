import {
  Checkbox,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationContext } from '../../contexts/ApplicationContext';
import { IDatatype } from '../../interfaces/api';
import { DEFAULT_SPACING } from '../../theme';
import { isJsonString } from '../../utils/strings';
import {
  DEFAULT_MESSAGE_STRING,
  MessageTypeGroup,
} from '../Buttons/MessageTypeGroup';

interface NetworkIdentity {
  did: string;
  id: string;
  name: string;
}

interface Props {
  tokenOperation?: 'mint' | 'transfer' | 'burn' | undefined;
  tokenBody?: object;
  tokenMissingFields?: boolean;
}

export const PrivateForm: React.FC<Props> = ({
  tokenOperation,
  tokenBody,
  tokenMissingFields,
}) => {
  const { jsonPayload, setJsonPayload, activeForm, setPayloadMissingFields } =
    useContext(ApplicationContext);
  const { t } = useTranslation();
  const [message, setMessage] = useState<string>(DEFAULT_MESSAGE_STRING);
  const [identities, setIdentities] = useState<NetworkIdentity[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [jsonValue, setJsonValue] = useState<string | undefined>();
  const [datatype, setDatatype] = useState<IDatatype | undefined>();

  const [tag, setTag] = useState<string>();
  const [topics, setTopics] = useState<string>();

  useEffect(() => {
    fetch(`/api/common/organizations?exclude_self=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setIdentities(data);
      })
      .catch(() => {
        return null;
      });
  }, []);

  useEffect(() => {
    if (!activeForm.includes('private') && !tokenOperation) {
      return;
    }
    setPayloadMissingFields(recipients.length === 0);
    const { jsonValue: jsonCurValue } = jsonPayload as any;
    const body = {
      topic: topics,
      tag,
      value: message,
      jsonValue: jsonValue && !message ? jsonCurValue : null,
      filename: fileName,
      recipients,
      datatypename: datatype?.name ?? '',
      datatypeversion: datatype?.version ?? '',
    };
    setJsonPayload(tokenOperation ? { ...tokenBody, ...body } : body);
  }, [
    message,
    recipients,
    tag,
    topics,
    fileName,
    activeForm,
    datatype,
    jsonValue,
  ]);

  useEffect(() => {
    if (jsonValue && isJsonString(jsonValue)) {
      setJsonValue(JSON.stringify(JSON.parse(jsonValue), null, 2));
      setMessage('');
      const body = getFormBody(JSON.parse(jsonValue));
      setJsonPayload(tokenOperation ? { ...tokenBody, ...body } : body);
    }
  }, [jsonValue]);

  const getFormBody = (json: object) => {
    return {
      topic: topics,
      tag,
      jsonValue: json,
      value: message,
      filename: fileName,
      recipients,
      datatypename: datatype?.name ?? '',
      datatypeversion: datatype?.version ?? '',
    };
  };

  const handleRecipientChange = (
    event: SelectChangeEvent<typeof recipients>
  ) => {
    const {
      target: { value },
    } = event;
    setRecipients(typeof value === 'string' ? value.split(',') : value);
  };

  const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length === 0) {
      setTag(undefined);
      return;
    }
    setTag(event.target.value);
  };

  const handleTopicsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length === 0) {
      setTopics(undefined);
      return;
    }
    setTopics(event.target.value);
  };

  return (
    <Grid container>
      <Grid container spacing={DEFAULT_SPACING}>
        <MessageTypeGroup
          noUndefined
          datatype={datatype}
          message={message}
          jsonValue={jsonValue}
          fileName={fileName}
          recipients={recipients}
          tokenMissingFields={tokenMissingFields}
          onSetMessage={(msg: string) => setMessage(msg)}
          onSetFileName={(file: string) => {
            setFileName(file);
          }}
          onSetJsonValue={(json: string) => {
            setJsonValue(json);
          }}
          onSetDatatype={(dt: IDatatype) => {
            setDatatype(dt);
          }}
        />
        <Grid container item justifyContent="space-between" spacing={1}>
          {/* Tag */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('tag')}
              placeholder={t('exampleTag')}
              onChange={handleTagChange}
            />
          </Grid>
          {/* Topic */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label={t('topic')}
              placeholder={t('exampleTopic')}
              onChange={handleTopicsChange}
            />
          </Grid>
        </Grid>
        <Grid container item>
          {/* Recipient Select box */}
          <FormControl fullWidth required>
            <InputLabel>{t('recipients')}</InputLabel>
            <Select
              multiple
              value={recipients}
              onChange={handleRecipientChange}
              input={<OutlinedInput label={t('recipients')} />}
              renderValue={(selected) => selected.join(', ')}
            >
              {identities.map((identity, idx) => (
                <MenuItem key={idx} value={identity.did}>
                  <Checkbox checked={recipients.indexOf(identity.did) > -1} />
                  <ListItemText primary={identity.did} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
};
