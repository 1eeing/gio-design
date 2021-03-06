import * as React from 'react';
import Input from '../input';
import Button from '../button';
import { SearchBarProps } from './interfaces';
import { CloseCircleFilled, SearchOutlined } from '@gio-design/icons';

export const prefixCls = 'gio-searchbar';

const getStorage = (key: string): string[] => {
  const empty: string[] = [];
  try {
    // @ts-ignore
    return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : empty;
  } catch (error) {
    return empty;
  }
};

const setStorage = (key: string, value: string) => {
  try {
    const oldValue = getStorage(key);
    if (!value || oldValue.some((item) => item === value)) {
      return oldValue;
    }
    const newValue = oldValue.concat(value);
    localStorage.setItem(key, JSON.stringify(newValue));
    return newValue;
  } catch (error) {
    return [];
  }
};

const findStorage = (key: string, value: string): string[] => {
  const storages = getStorage(key);
  return storages.filter((item) => item.startsWith(value));
};

const clearStorage = (key: string): string[] => {
  localStorage.removeItem(key);
  return [];
};

const SearchBar: React.FC<SearchBarProps> = ({
  showStorage = false,
  storageNum = 5,
  allowClearStorage = false,
  showClear = false,
  disabled = false,
  size = 'medium',
  inputStyle,
  inputWrapStyle,
  wrapStyle,

  value,
  onChange,
  id,
}) => {
  const storageKey = React.useMemo(() => `${prefixCls}-storage-${id}`, [id]);

  const [searchStorage, setSearchStorage] = React.useState(getStorage(storageKey));
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleClearStorage = () => {
    const emptyValue = clearStorage(storageKey);
    setSearchStorage(emptyValue);
  };

  const handleClearValue = () => {
    onChange('');
    const newValue = findStorage(storageKey, '');
    setSearchStorage(newValue);
  };

  const handleChange = (v: string) => {
    onChange(v);
    const newValue = findStorage(storageKey, v);
    setSearchStorage(newValue);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTimeout(() => {
      setStorage(storageKey, value);
      setShowDropdown(false);
    }, 200);
  };

  const renderSuffix = () => {
    if (value) {
      return showClear ? (
        <CloseCircleFilled className={`${prefixCls}-suffix-close`} onClick={handleClearValue} />
      ) : null;
    }
    return <SearchOutlined className={`${prefixCls}-suffix-search`} />;
  };

  const renderStorage = () => {
    if (!showStorage || !showDropdown) {
      return null;
    }

    return (
      <div className={prefixCls + '-dropdown'}>
        {allowClearStorage && (
          <div className={prefixCls + '-dropdown-clear'}>
            <span className={prefixCls + '-dropdown-clear-text'}>显示最近{storageNum}条搜索记录</span>
            <Button type="text" onClick={handleClearStorage}>
              清除
            </Button>
          </div>
        )}
        {searchStorage.slice(0, storageNum).map((item) => (
          <div
            onClick={() => {
              onChange(item);
            }}
            className={prefixCls + '-dropdown-item'}
            key={item}
          >
            {item}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={prefixCls} style={wrapStyle}>
      <Input
        disabled={disabled}
        size={size}
        inputStyle={inputStyle}
        wrapStyle={inputWrapStyle}
        suffix={renderSuffix()}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {renderStorage()}
    </div>
  );
};

export default SearchBar;
