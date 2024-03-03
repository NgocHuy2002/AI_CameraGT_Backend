import * as Service from '../RefreshToken/refreshToken.service';

export default {
  async getByRefreshToken(req, res) {
    try {
      const refreshToken = Object.keys(req.body)[0];
      const query = { user_id: req.user?._id, refresh_token: refreshToken, is_deleted: false };
      const dataResponse = await Service.getAll(query);

      return res.json({ dataResponse });
    } catch (err) {
      return res.status(500).send(err);
    }
  },
  async deleteByRefreshToken(req, res) {
    try {
      const refreshToken = Object.keys(req.query)[0];
      const query = { user_id: req.user?._id, refresh_token: refreshToken, is_deleted: false };
      const dataResponse = await Service.deleteOne(query);

      return res.json({ dataResponse });
    } catch (err) {
      return res.status(500).send(err);
    }
  },
};
