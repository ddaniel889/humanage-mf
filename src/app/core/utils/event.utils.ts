export function emitEventAndWait<T>(name: string, data?: object): Promise<T> {
  const promise = new Promise<T>((resolve, reject) => {
    const event = new CustomEvent(name, {
      detail: {
        ...data,
        callbackFn: (data: T) => {
          resolve(data);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        errorFn: (error: any) => {
          reject(error);
        },
      },
    });

    window.dispatchEvent(event);
  });

  return promise;
}

export function emitEvent(name: string, data?: object): void {
  const event = new CustomEvent(name, {
    detail: { ...data },
  });

  window.dispatchEvent(event);
}
