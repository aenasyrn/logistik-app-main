import { router } from "@inertiajs/react";

const appendParams = (url, params = {}) => {
  const target = new URL(url, window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) target.searchParams.set(key, value);
  });
  return `${target.pathname}${target.search}${target.hash}`;
};

const responseFromPage = (page) => {
  const result = page.props.flash?.inertiaResult;
  const data = result?.data ?? (page.props.flash?.message ? { message: page.props.flash.message } : page.props);
  const status = result?.status ?? 200;
  return { data, status, page };
};

const rejectForResponse = (response) => {
  const message = response.data?.message || "Permintaan tidak berhasil.";
  const error = new Error(message);
  error.response = response;
  return error;
};

const cancelledRequest = () => Object.assign(new Error("Permintaan dibatalkan."), { cancelled: true });

export function visitInertia(url, {
  method = "get",
  data = {},
  params,
  only,
  preserveState = true,
  preserveScroll = true,
} = {}) {
  const target = method.toLowerCase() === "get" ? appendParams(url, params) : url;
  const visitData = method.toLowerCase() === "get" ? data : { ...data, ...params };

  return new Promise((resolve, reject) => {
    router.visit(target, {
      method,
      data: visitData,
      only,
      preserveState,
      preserveScroll,
      onSuccess: (page) => {
        const response = responseFromPage(page);
        if (response.status >= 400 || response.data?.success === false) {
          reject(rejectForResponse(response));
          return;
        }
        resolve(response);
      },
      onError: (errors) => {
        const message = Object.values(errors).flat()[0] || "Permintaan tidak berhasil.";
        reject(rejectForResponse({ data: { errors, message }, status: 422 }));
      },
      onCancel: () => reject(cancelledRequest()),
    });
  });
}

export function reloadInertiaProps({ data = {}, only = [] } = {}) {
  return new Promise((resolve, reject) => {
    router.reload({
      data,
      only,
      async: true,
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page) => resolve(page.props),
      onError: (errors) => reject(errors),
      onCancel: () => reject(cancelledRequest()),
    });
  });
}

export async function fetchJson(url, { method = "GET", params, data, headers = {} } = {}) {
  const target = method.toUpperCase() === "GET" && params ? appendParams(url, params) : url;
  const config = {
    method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...headers,
    },
  };
  if (data && method.toUpperCase() !== "GET") {
    config.body = JSON.stringify(data);
  }
  const res = await fetch(target, config);
  const json = await res.json();
  if (!res.ok) {
    const error = new Error(json.message || "Permintaan tidak berhasil.");
    error.response = { data: json, status: res.status };
    throw error;
  }
  return { data: json, status: res.status };
}