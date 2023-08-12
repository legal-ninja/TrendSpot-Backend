import { NextFunction, Request, Response } from "express";
import handleAsync from "../../../helpers/async.handler";
import axios from "axios";

export const getExternalNews = handleAsync(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = process.env.NEWS_API_KEY;
  const apiUrl = `${process.env.NEWS_API_URL}/top-headlines`;
  const { countryCode } = req.query;
  const { category } = req.query;

  const requestToNewsAPI = await axios.get(apiUrl, {
    params: {
      apiKey,
      country: countryCode ? countryCode : "us",
      category: category ? category : "general",
    },
  });
  const news = requestToNewsAPI.data.articles;

  res.status(200).json({
    status: "success",
    results: news.length,
    news,
  });
});
