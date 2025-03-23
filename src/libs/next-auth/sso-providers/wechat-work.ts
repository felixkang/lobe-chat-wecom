import { OAuthConfig } from 'next-auth/providers';

import { authEnv } from '@/config/auth';

export interface WeChatWorkProfile {
  userid: string;
  name: string;
  department: number[];
  position: string;
  mobile: string;
  gender: string;
  email: string;
  avatar: string;
  status: number;
  enable: number;
  isleader: number;
  extattr: { attrs: any[] };
  telephone: string;
  alias: string;
  address: string;
  thumb_avatar: string;
  qr_code: string;
}

interface WeChatWorkTokenResponse {
  access_token: string;
  errcode: number;
  errmsg: string;
}

interface WeChatWorkUserInfoResponse {
  UserId: string;
  errcode: number;
  errmsg: string;
}

interface WeChatWorkUserDetailResponse extends WeChatWorkProfile {
  errcode: number;
  errmsg: string;
}

/**
 * WeChat Work provider configuration
 */
const WeChatWorkProvider: OAuthConfig<WeChatWorkProfile> = {
  id: 'wechat-work',
  name: 'WeChat Work',
  type: 'oauth',
  clientId: authEnv.WECHAT_WORK_CORP_ID,
  clientSecret: authEnv.WECHAT_WORK_SECRET,
  
  // WeChat Work specific OAuth endpoints
  authorization: {
    url: 'https://open.work.weixin.qq.com/wwopen/sso/qrConnect',
    params: {
      appid: authEnv.WECHAT_WORK_CORP_ID,
      agentid: authEnv.WECHAT_WORK_AGENT_ID,
      response_type: 'code',
      scope: 'snsapi_base',
    },
  },
  
  // 添加 userinfo 端点配置
  userinfo: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo',
    // 此处留空，因为实际的参数会在 token 请求中添加
    params: { foo: 'bar' },
  },
  
  // Handle token exchange and user info fetching
  token: {
    url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
    async request({ client, params }: any) {
      const { code } = params as { code: string };
      
      // Get access token
      const accessTokenRes = await fetch(
        `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${client.clientId}&corpsecret=${client.clientSecret}`,
      );
      const accessTokenData = (await accessTokenRes.json()) as WeChatWorkTokenResponse;

      if (accessTokenData.errcode !== 0) {
        throw new Error(accessTokenData.errmsg);
      }

      // Get user info using the code
      const userInfoRes = await fetch(
        `https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${accessTokenData.access_token}&code=${code}`,
      );
      const userInfoData = (await userInfoRes.json()) as WeChatWorkUserInfoResponse;

      if (userInfoData.errcode !== 0) {
        throw new Error(userInfoData.errmsg);
      }

      // Get detailed user information
      const userDetailRes = await fetch(
        `https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=${accessTokenData.access_token}&userid=${userInfoData.UserId}`,
      );
      const userDetail = (await userDetailRes.json()) as WeChatWorkUserDetailResponse;

      if (userDetail.errcode !== 0) {
        throw new Error(userDetail.errmsg);
      }

      return {
        tokens: { 
          access_token: accessTokenData.access_token,
        },
        profile: userDetail,
      };
    },
  },
  
  // User profile transformation
  profile(profile) {
    return {
      id: profile.userid,
      name: profile.name,
      email: profile.email || "",
      image: profile.avatar,
    };
  },
  
  // UI styling
  style: {
    bg: '#07C160',
    logo: '/assets/wechat-work.svg',
    text: '#fff',
  },
};

// Export config for auth.ts
export const config = {
  WECHAT_WORK_AGENT_ID: {
    description: 'WeChat Work Agent ID',
    required: true,
  },
  WECHAT_WORK_CORP_ID: {
    description: 'WeChat Work Corp ID',
    required: true,
  },
  WECHAT_WORK_SECRET: {
    description: 'WeChat Work Secret',
    required: true,
  },
};

export default {
  id: 'wechat-work',
  provider: WeChatWorkProvider,
  config,
};
