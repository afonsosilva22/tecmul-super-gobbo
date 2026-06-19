export const formatTimer = (milliseconds, roundUp = false) => {
    const totalSeconds = Math.max(0, roundUp ? Math.ceil(milliseconds / 1000) : Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
