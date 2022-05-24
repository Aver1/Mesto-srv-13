const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => {
      res.status(200);
      res.send(cards);
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;
  const userId = req.user._id;

  if (!name || !link) {
    res.status(400).send({ message: 'name or link are not correct' });
    return;
  }

  Card.create({ name, link, owner: userId })
    .then((card) => res.status(200).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: 'name, link are not correct' });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .then((card) => {
      res.status(200);
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .then((card) => {
      res.status(200);
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.path === 'likes') {
        res.status(400).send({ message: 'Переданы некорректные данные' });
        return;
      }
      if (err.path === '_id') {
        res.status(404).send({ message: 'Карточка с указанным id не найдена.' });
        return;
      }
      res.status(500).send({ err });
    });
};

module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .then((card) => {
      res.status(200);
      res.send({ data: card });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};
