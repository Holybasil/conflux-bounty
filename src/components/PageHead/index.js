import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './action';

import headImg from '../../assets/iconfont/conflux-head-logo.svg';
import homeImg from '../../assets/iconfont/conflux-home-logo.svg';
import languageImg from '../../assets/iconfont/bounty-header-language.svg';
import UserBack from '../../assets/iconfont/user-back.svg';
import { i18n, compose, commonPropTypes, auth, isPath } from '../../utils';
import PhotoImg from '../PhotoImg';
import Select from '../Select';

const Bountylogo = styled.img`
  height: 100%;
`;
const CreateButton = styled.button`
  display: flex;
  align-items: center;
  @media screen and (max-width: 425px) {
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    .material-icons {
      height: 32px;
      line-height: 32px;
    }
  }
`;
const Operator = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  & > *:nth-child(n + 1) {
    margin-left: 15px;
  }

  .red-dot {
    position: absolute;
    width: 8px;
    height: 8px;
    right: -4px;
    top: -4px;
    border-radius: 50%;
    z-index: 220;
    background: #f0453a;
  }
  .red-dot-hidden {
    display: none;
  }
  .bounty-user-nologin,
  .bounty-language {
    width: 40px;
    height: 40px;
    font-size: 40px;
    line-height: 40px;
    cursor: pointer;
    background-color: transparent;
    @media screen and (max-width: 425px) {
      height: 32px;
      width: 32px;
      font-size: 32px;
      line-height: 32px;
    }
  }
  .bounty-user-login {
    position: relative;
    @media screen and (max-width: 425px) {
      height: 32px;
      width: 32px;
      font-size: 32px;
      line-height: 32px;
    }
  }
  a:hover {
    text-decoration: none;
  }
  .head-select {
    width: 88px;
    .select .caret {
      top: 10px;
      right: 2px;
    }
    .input-field {
      margin-top: 0;
      margin-bottom: 0;
      > input {
        cursor: pointer;
        height: 44px;
        margin: 0;
        text-indent: 10px;
      }
    }
  }
`;
const Wrap = styled.div`
  width: 100%;
  display: flex;
  height: 80px;
  padding: 20px;
  z-index: 100;
  @media screen and (max-width: 425px) {
    height: 56px;
    padding: 12px;
  }
  &.normal {
    background: #ffffff;
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.12);
    margin-bottom: 40px;
    position: sticky;
    top: 0;
    background: #fff;
  }

  &.home {
    .head-select {
      .input-field input {
        color: #fff;
      }
      .caret path:first-child {
        stroke: #fff;
        fill: #fff;
      }
    }
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
class PageHead extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      homeSticky: false,
    };

    // navigator.language to google translationg compatible language code
    // eg. zh -> zh-CN, en-US -> en
    let lang = localStorage.getItem('SITE_LANG') || navigator.language;
    if (lang.startsWith('zh')) {
      lang = 'zh-CN';
    }

    if (lang.startsWith('en')) {
      lang = 'en';
    }

    // TODO: support more language
    if (lang !== 'zh-CN') {
      lang = 'en';
    }

    const { updateCommon } = this.props;
    updateCommon({
      lang,
    });
  }

  componentDidMount() {
    const { getAccount, getUnreadMessageCount, history } = this.props;
    if (auth.loggedIn()) {
      getAccount();
      getUnreadMessageCount();
    }

    const pageWrapper = document.getElementById('page-wrapper');
    this.onScroll = () => {
      const { homeSticky } = this.state;
      if (pageWrapper.scrollTop > 200) {
        if (homeSticky === false) {
          this.setState({
            homeSticky: true,
          });
        }
      } else if (homeSticky === true) {
        this.setState({
          homeSticky: false,
        });
      }
    };

    history.listen((location, action) => {
      if (action === 'PUSH') {
        pageWrapper.scrollTop = 0;
      }
    });

    history.listen(location => {
      if (isPath(location, '/')) {
        pageWrapper.addEventListener('scroll', this.onScroll);
      } else {
        pageWrapper.removeEventListener('scroll', this.onScroll);
      }
    });
    // eslint-disable-next-line react/destructuring-assignment
    if (isPath(this.props.location, '/')) {
      pageWrapper.addEventListener('scroll', this.onScroll);
    }
  }

  createBounty = () => {
    const { history } = this.props;

    if (!auth.loggedIn()) {
      history.push(`/signin`);
    } else {
      history.push('/create-bounty');
    }
  };

  render() {
    const { head, location, updateCommon, lang } = this.props;
    const { homeSticky } = this.state;
    let wrapClass;
    if (isPath(location, '/')) {
      if (homeSticky === true) {
        wrapClass = 'normal';
      } else {
        wrapClass = 'home';
      }
    } else {
      wrapClass = 'normal';
    }
    const isMobile = window.innerWidth <= '425';
    return (
      <Wrap className={wrapClass}>
        <Link to="/">
          <Bountylogo src={wrapClass === 'home' ? homeImg : headImg} className="bountylogo" alt="bountylogo" />
        </Link>

        <Operator>
          <CreateButton className="btn primary" type="button" onClick={this.createBounty}>
            <i className="material-icons dp48">add</i>
            {!isMobile && <span>{i18n('CREATE BOUNTY')}</span>}
          </CreateButton>

          {auth.loggedIn() ? (
            <Link to="/user-info" className="bounty-user-login">
              <PhotoImg imgSrc={head.user.photoUrl || UserBack} alt="userimg" />
              <i className={head.messageCount > 0 ? 'red-dot' : 'red-dot-hidden'} />
            </Link>
          ) : (
            <Link
              to="/signin"
              className="bounty-user-nologin"
              style={{
                color: wrapClass === 'home' ? '#fff' : '#171D1F',
              }}
            />
          )}
          {isMobile ? (
            <div className="bounty-language">
              <PhotoImg imgSrc={languageImg} alt="languageImg" />
            </div>
          ) : (
            <div className="head-select">
              <Select
                {...{
                  label: '',
                  onSelect: v => {
                    updateCommon({
                      lang: v.value,
                    });
                  },
                  options: [
                    {
                      label: 'English',
                      value: 'en',
                    },
                    {
                      label: '中文',
                      value: 'zh-CN',
                    },
                  ],
                  selected: {
                    value: lang,
                  },
                }}
              />
            </div>
          )}
        </Operator>
      </Wrap>
    );
  }
}

PageHead.propTypes = {
  history: commonPropTypes.history.isRequired,
  location: commonPropTypes.location.isRequired,
  /* eslint react/forbid-prop-types: 0 */
  getAccount: PropTypes.object.isRequired,
  getUnreadMessageCount: PropTypes.object.isRequired,
  head: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
  updateCommon: PropTypes.func.isRequired,
};
PageHead.defaultProps = {};

function mapStateToProps(state) {
  return {
    head: {
      ...state.head,
      user: state.head.user || {},
    },
    lang: state.common.lang,
  };
}
const enhance = compose(
  withRouter,
  connect(
    mapStateToProps,
    actions
  )
);
export default enhance(PageHead);
