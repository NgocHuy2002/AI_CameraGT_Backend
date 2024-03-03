import CAMERA from './../Camera/camera.model';


import * as fileUtils from '../../utils/fileUtils';

import * as responseHelper from "../../helpers/responseHelper";

const fs = require('fs');
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const { spawn } = require('child_process');
const path = require("path");

ffmpeg.setFfmpegPath(ffmpegStatic);
let ffmpegProcess;

export async function stream(req, res) {
    try {
        const { rtsp_link, domain } = req.body;
        // if (error) return responseHelper.error(res, error, 400);
        console.log(rtsp_link);
        console.log(domain);
        const cameraData = await CAMERA.findOne({ domain: domain });
        let outputDir = null;
        if (cameraData) {
            outputDir = `./storage/videos/${cameraData.name}/`;
        }
        else {
            return responseHelper.error(res, 'Wrong domain', 400);
        }

        if (outputDir) {
            if (!fs.existsSync('./storage/videos/')) {
                fs.mkdirSync('./storage/videos/', { recursive: true });
            }
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            else{
                fs.readdir(outputDir, (err, files) => {
                    if (err) throw err;
                  
                    for (const file of files) {
                      fs.unlink(path.join(outputDir, file), (err) => {
                        if (err) throw err;
                      });
                    }
                  });
            }
        }

        ffmpegProcess = spawn('ffmpeg', [
            '-rtsp_transport', 'tcp',
            '-i', rtsp_link,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-tune', 'zerolatency',
            '-b:v', '900k',
            '-f', 'hls',
            '-hls_time', '6',
            '-hls_list_size', '0',
            `${outputDir}stream.m3u8`
        ]);

        ffmpegProcess.stdout.on('data', (data) => {
            console.log(`FFMPEG stdout: ${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
            console.error(`FFMPEG stderr: ${data}`);
        });

        ffmpegProcess.on('close', (code) => {
            console.log(`FFMPEG process exited with code ${code}`);
        });

        process.on('SIGINT', () => {
            console.log('Stopping FFMPEG process...');
            ffmpegProcess.kill('SIGINT');
        });

        return responseHelper.success(res, domain);
    } catch (error) {
        return responseHelper.error(res, error, 500);
    }


    // const outputDir = 'storage/videos/';
    // const rtspStreamUrl = 'rtsp://admin:Cahh@12345@cahh49.smartddns.tv:37779/cam/realmonitor?channel=1&subtype=0'; // IP camera's RTSP stream URL

    // const ffmpegProcess = spawn('ffmpeg', [
    //   '-rtsp_transport', 'tcp',
    //   '-i', rtspStreamUrl,
    //   '-c:v', 'libx264',
    //   '-preset', 'veryfast',
    //   '-tune', 'zerolatency',
    //   '-b:v', '900k',
    //   '-f', 'hls',
    //   '-hls_time', '6',
    //   '-hls_list_size', '0',
    //   `${outputDir}stream.m3u8`
    // ]);

    // ffmpegProcess.stdout.on('data', (data) => {
    //   console.log(`FFMPEG stdout: ${data}`);
    // });

    // ffmpegProcess.stderr.on('data', (data) => {
    //   console.error(`FFMPEG stderr: ${data}`);
    // });

    // ffmpegProcess.on('close', (code) => {
    //   console.log(`FFMPEG process exited with code ${code}`);
    // });

    // process.on('SIGINT', () => {
    //   console.log('Stopping FFMPEG process...');
    //   ffmpegProcess.kill('SIGINT');
    // });
}

export async function stop_stream(req, res) {
    if (ffmpegProcess) {
        ffmpegProcess.kill('SIGINT'); // Send SIGINT signal to terminate the process
    }
    res.send('Stream stopped');
}