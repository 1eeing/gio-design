import React from 'react';
import Banner from '../Banner';
import '@gio-design/components/es/components/banner/style/index.css';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

describe('Testing Banner', () => {
  it('should be stable', () => {
    const wrapper = renderer.create(<Banner>快照</Banner>).toJSON();
    expect(wrapper).toMatchSnapshot();
  });

  it('should be mount, setProps, unmount with no error', () => {
    expect(() => {
      const wrapper = mount(<Banner />);
      wrapper.setProps({
        type: 'normal',
        closeable: true,
        content: 'content',
      });
      wrapper.unmount();
    }).not.toThrow();
  });

  it('props content', () => {
    const stringwrapper = mount(<Banner type="normal" content="content" />).children();
    expect(stringwrapper.childAt(0).text()).toBe(' content');
    const nodeWrapper = mount(<Banner content={<div>content</div>} />).children();
    expect(nodeWrapper.childAt(0).type()).toBe('div');
  });

  it('props type', () => {
    expect(mount(<Banner type="normal" />).exists('.gio-banner-normal')).toBe(true);
    expect(mount(<Banner type="alert" />).exists('.gio-banner-alert')).toBe(true);
  });
});
