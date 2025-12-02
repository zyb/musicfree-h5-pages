// Cloudflare Worker 入口 - 处理 API 代理请求
// 静态资源由 [assets] 配置自动处理

export interface Env {
  ASSETS: Fetcher
}

// 代理目标映射
const proxyTargets: Record<string, { target: string; headers?: Record<string, string> }> = {
  // ============ QQ 音乐 ============
  'qqu': { target: 'https://u.y.qq.com', headers: { referer: 'https://y.qq.com/', origin: 'https://y.qq.com' } },
  'qqc': { target: 'https://c.y.qq.com', headers: { referer: 'https://y.qq.com/', origin: 'https://y.qq.com' } },
  'qqi': { target: 'https://i.y.qq.com', headers: { referer: 'https://y.qq.com/', origin: 'https://y.qq.com' } },
  'qqshc': { target: 'https://shc.y.qq.com', headers: { referer: 'https://y.qq.com' } },
  
  // ============ 网易云音乐 ============
  'netease': { target: 'https://music.163.com', headers: { referer: 'https://music.163.com/', origin: 'https://music.163.com' } },
  'neteaseapi': { target: 'https://interface.music.163.com', headers: { referer: 'https://music.163.com/' } },
  'neteasem': { target: 'https://interface3.music.163.com', headers: { referer: 'https://music.163.com/' } },
  
  // ============ 酷狗音乐 ============
  'kugou': { target: 'https://www.kugou.com', headers: { referer: 'https://www.kugou.com/' } },
  'kugousearch': { target: 'https://songsearch.kugou.com', headers: { referer: 'https://www.kugou.com/' } },
  'kugoucomplex': { target: 'https://complexsearch.kugou.com', headers: { referer: 'https://www.kugou.com/' } },
  'kugouwww': { target: 'https://wwwapi.kugou.com', headers: { referer: 'https://www.kugou.com/' } },
  'kugougateway': { target: 'https://gateway.kugou.com' },
  'kugoutracker': { target: 'https://trackercdnbj.kugou.com' },
  'kugoumobile': { target: 'https://mobilecdn.kugou.com' },
  'kugouservice': { target: 'https://mobileservice.kugou.com' },
  
  // ============ 酷我音乐 ============
  'kuwo': { target: 'https://www.kuwo.cn', headers: { referer: 'https://www.kuwo.cn/', csrf: 'HH9GS5IV6V0', cookie: 'kw_token=HH9GS5IV6V0' } },
  'kuwoapi': { target: 'https://kuwo.cn', headers: { referer: 'https://www.kuwo.cn/', csrf: 'HH9GS5IV6V0', cookie: 'kw_token=HH9GS5IV6V0' } },
  'kuwosearch': { target: 'http://search.kuwo.cn', headers: { 'user-agent': 'kwplayer_ar_8.5.4.2' } },
  
  // ============ 咪咕音乐 ============
  'migu': { target: 'https://music.migu.cn', headers: { referer: 'https://music.migu.cn/' } },
  'migum': { target: 'https://m.music.migu.cn', headers: { referer: 'https://m.music.migu.cn/' } },
  'miguapp': { target: 'https://app.c.nf.migu.cn' },
  'migucdn': { target: 'https://c.musicapp.migu.cn' },
  'migupdms': { target: 'https://jadeite.migu.cn' },
  
  // ============ B站音频 ============
  'bili': { target: 'https://www.bilibili.com', headers: { referer: 'https://www.bilibili.com/' } },
  'biliapi': { target: 'https://api.bilibili.com', headers: { referer: 'https://www.bilibili.com/' } },
  
  // ============ 5sing ============
  '5sing': { target: 'http://5sing.kugou.com' },
  '5singfc': { target: 'http://5singfc.kugou.com' },
  
  // ============ 千千音乐 ============
  'qianqian': { target: 'https://music.91q.com', headers: { referer: 'https://music.91q.com/' } },
  
  // ============ 喜马拉雅 ============
  'xmly': { target: 'https://www.ximalaya.com', headers: { referer: 'https://www.ximalaya.com/' } },
  'xmlymobile': { target: 'https://mobile.ximalaya.com' },
  
  // ============ 懒人听书 ============
  'lrts': { target: 'https://www.lrts.me' },
  
  // ============ 猫耳 FM ============
  'missevan': { target: 'https://www.missevan.com', headers: { referer: 'https://www.missevan.com/' } },
  
  // ============ 荔枝 FM ============
  'lizhi': { target: 'https://www.lizhi.fm' },
  
  // ============ zz123 聚合搜索 ============
  'zz123': { target: 'https://zz123.com', headers: { referer: 'https://zz123.com/', origin: 'https://zz123.com' } },
  
  // ============ 歌曲宝 ============
  'gequbao': { target: 'https://www.gequbao.com', headers: { referer: 'https://www.gequbao.com/', origin: 'https://www.gequbao.com' } },
  
  // ============ Suno ============
  'suno': { target: 'https://studio-api.suno.ai', headers: { referer: 'https://suno.ai/', origin: 'https://suno.ai' } },
  
  // ============ Gitee (插件托管) ============
  'gitee': { target: 'https://gitee.com', headers: { referer: 'https://gitee.com/' } },
  'giteeraw': { target: 'https://gitee.com', headers: { referer: 'https://gitee.com/', accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } },
  
  // ============ GitHub (插件托管) ============
  'github': { target: 'https://raw.githubusercontent.com' },
  'ghproxy': { target: 'https://ghproxy.com' },
  
  // ============ 海棠音乐 ============
  'haitang': { target: 'http://musicapi.haitangw.net' },
  'haitangm': { target: 'http://music.haitangw.net' },
  
  // ============ 网易音乐解析服务 ============
  'duanx': { target: 'https://share.duanx.cn' },
  'haitangcc': { target: 'https://music.haitangw.cc' },
  'lxmusic': { target: 'https://lxmusicapi.onrender.com' },
  'netease163': { target: 'http://music.163.com', headers: { referer: 'https://music.163.com/' } },
  
  // ============ 其他常见 API ============
  'aggregator': { target: 'https://api.lolimi.cn' },
  'myfreemp3': { target: 'https://api.xingzhige.com' },
}

const commonHeaders: Record<string, string> = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

// 处理代理请求
async function handleProxy(request: Request, pathname: string): Promise<Response> {
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }
  
  // 解析路径: /api/proxy/[proxyType]/[...rest]
  const pathParts = pathname.replace('/api/proxy/', '').split('/').filter(Boolean)
  const proxyType = pathParts[0]
  const targetPath = '/' + pathParts.slice(1).join('/')
  
  if (!proxyType || !proxyTargets[proxyType]) {
    return new Response(JSON.stringify({ 
      error: 'Invalid proxy type', 
      available: Object.keys(proxyTargets),
      received: proxyType,
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
  
  const config = proxyTargets[proxyType]
  const url = new URL(request.url)
  const targetUrl = config.target + targetPath + url.search
  
  try {
    // 构建请求头
    const headers = new Headers()
    
    // 添加通用头
    for (const [key, value] of Object.entries(commonHeaders)) {
      headers.set(key, value)
    }
    
    // 添加特定代理的头
    if (config.headers) {
      for (const [key, value] of Object.entries(config.headers)) {
        headers.set(key, value)
      }
    }
    
    // 复制原始请求的某些头
    const forwardHeaders = ['content-type', 'accept', 'accept-language']
    for (const header of forwardHeaders) {
      const value = request.headers.get(header)
      if (value) {
        headers.set(header, value)
      }
    }
    
    // 发送代理请求
    const proxyResponse = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
    })
    
    // 创建响应头
    const responseHeaders = new Headers()
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // 复制原响应的 Content-Type
    const contentType = proxyResponse.headers.get('content-type')
    if (contentType) {
      responseHeaders.set('Content-Type', contentType)
    }
    
    // 返回响应
    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders,
    })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Proxy request failed', 
      message: error instanceof Error ? error.message : 'Unknown error',
      target: targetUrl,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const pathname = url.pathname
    
    // 处理 API 代理请求
    if (pathname.startsWith('/api/proxy/')) {
      return handleProxy(request, pathname)
    }
    
    // 其他请求交给静态资源处理
    return env.ASSETS.fetch(request)
  },
}

