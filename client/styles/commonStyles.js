import Colors from './colors';

const commonStyles = {
  titleText: {
    fontSize: 16,
    fontWeight: 600,
  },
  inputTitleWrapper: {
    width: '100%',
    marginTop: 10,
    marginBottom: 20,
  },
  inputTitle: {
    height: 40,
    backgroundColor: Colors.mainWhite,
    width: '100%',
    fontSize: 18,
    borderRadius: 4,
    marginBottom: 0,
  },
  inputFileHidden: {
    position: 'absolute',
    display: 'block',
    overflow: 'hidden',
    width: 0,
    height: 0,
    border: 0,
    padding: 0,
  },
  inputFileVisible: {
    backgroundColor: 'transparent',
    width: 'calc(100% - 70px)',
    height: 40,
    float: 'left',
  },
  hostImage: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: Colors.mainWhite,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.lightGrey,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center center',
    backgroundSize: 'cover',
  },
  tableWrapper: {
    marginTop: 25,
    backgroundColor: Colors.mainWhite,
    padding: 25,
    overflow: 'auto',
    maxHeight: 650,
  },
};

export default commonStyles;
