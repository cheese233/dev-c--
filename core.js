export const logMsg = (msg) => {
    console.log(msg);
    document.getElementById("msg").innerText = msg;
    setTimeout(() => {
        document.getElementById("msg").innerText = "";
    }, 5000);
};
export const getTime = async (func, callback, ...args) => {
    const t = new Date();
    const f = await func(args);
    callback(new Date() - t);
    return f;
};
