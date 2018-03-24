<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use JMS\Serializer\SerializationContext;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use AppBundle\Entity\User;
use AppBundle\Form\UserType;


class RestController extends Controller
{

  /**
  * @Rest\View()
  * @Get("/api/users")
  */
  public function showAction(Request $request)
  {

    $em = $this->getDoctrine()->getManager();

    $moustiques = $em->getRepository('AppBundle:User')->findAll();
    $response = new Response($this->serialize($moustiques));
    $response->headers->set('Content-Type', 'application/json');
    // Allow all websites
    $response->headers->set('Access-Control-Allow-Origin', '*');
    return $response;

  }

  /**
  * @Rest\View()
  * @Get("/api/user/{id}")
  */
  public function viewAction(Request $request)
  {
    $em = $this->getDoctrine()->getManager();
    $moustique = $em->getRepository('AppBundle:User')->findOneById($request->get('id'));

    return $moustique;

  }


  /**
  * @Rest\View()
  * @Get("/api/profile")
  */
  public function profileAction(Request $request)
  {

    $em = $this->getDoctrine()->getManager();
    $moustique = $em->getRepository('AppBundle:User')->findOneById($this->getUser()->getId());
    return $moustique;
  }

  /**
  * @Rest\View()
  * @pOST("/api/updateProfile")
  */
  public function profilAction(Request $request)
  {

    $em = $this->getDoctrine()->getManager();
    $moustique = $em->getRepository('AppBundle:User')->findOneById($this->getUser()->getId());
    $form = $this->createForm('AppBundle\Form\UserType',$moustique);

    if ($form->handleRequest($request)->isSubmitted() && $form->isValid()) {
      $this->getDoctrine()->getManager()->flush();

      return new Response('updated profile');
    }
    return new Response('error');

  }

  /**
  * @Rest\View()
  * @Get("/api/add/{id}")
  */
  public function addAction(Request $request)
  {
    $em = $this->getDoctrine()->getManager();
    $moustiqueSource = $em->getRepository('AppBundle:User')->findOneById($this->getUser()->getId());
    $moustiqueCible = $em->getRepository('AppBundle:User')->findOneById($request->get('id'));
    $moustiqueSource->addMoustique($moustiqueCible);
    $temp = $moustiqueSource->getMoustiques();
    $em->persist($moustiqueSource);
    $em->flush();
    return $temp;

  }

  /**
  * @Rest\View()
  * @Get("/api/remove/{id}")
  */
  public function removeAction(Request $request)
  {
    $em = $this->getDoctrine()->getManager();
    $moustiqueSource = $em->getRepository('AppBundle:User')->findOneById($this->getUser()->getId());
    $moustiqueCible = $em->getRepository('AppBundle:User')->findOneById($request->get('id'));
    $moustiqueSource->removeMoustique($moustiqueCible);
    $temp = $moustiqueSource->getMoustiques();
    $em->persist($moustiqueSource);
    $em->flush();
    return $temp;

  }

  /**
  * @Rest\View()
  * @Get("/api/mesMoustiques")
  */
  public function listAction(Request $request)
  {

    $em = $this->getDoctrine()->getManager();
    $moustiqueSource = $em->getRepository('AppBundle:User')->findOneById($this->getUser()->getId());

    $temp = $moustiqueSource->getMoustiques();

    return $temp;

  }

  /**
  * @Rest\View()
  * @Post("/api/register")
  */
  public function registerAction(Request $request)
  {
        $user = new User();
        $form = $this->createForm(UserType::class, $user);

    if ($form->handleRequest($request)->isSubmitted() && $form->isValid()) {

        // Encode the new users password
        $encoder = $this->get('security.password_encoder');
        $password = $encoder->encodePassword($user, $user->getPlainPassword());
        $user->setPassword($password);

        // Set their role
        $user->setRole('ROLE_USER');

        // Save
        $em = $this->getDoctrine()->getManager();
        $em->persist($user);
        $em->flush();

        return new Response('Created User');
    }
    else {
      //return new Response('not created user');
      return new Response('error');
    }
    //return new Response($data['test']);

  }

  /**
  * @Rest\View()
  * @Post("/api/login")
  */
  public function loginAction(Request $request)
  {
       $username = $request->getUser();
       $password = $request->getPassword();

       $em = $this->getDoctrine()->getManager();
       $user = $em->getRepository('AppBundle:User')->findOneByName($username);

       if (!$user) {
           throw $this->createNotFoundException();
       }

       $isValid = $this->get('security.password_encoder')
           ->isPasswordValid($user, $password);

       if (!$isValid) {
           throw new BadCredentialsException();
       }

       $token = $this->getToken($user);
       $response = new Response($this->serialize(['token' => $token]), Response::HTTP_OK);

       return $this->setBaseHeaders($response);

  }

  /**
 * Returns token for user.
 *
 * @param User $user
 *
 * @return array
 */
public function getToken(User $user)
{/*
    return $this->container->get('lexik_jwt_authentication.encoder.default')
            ->encode([
                'username' => $user->getName(),
                'exp' => $this->getTokenExpiryDateTime(),
            ]);
            */

            return $this->container->get('lexik_jwt_authentication.encoder.default')
                    ->encode([
                        'username' => $user->getName(),
                        'exp' => $this->getTokenExpiryDateTime(),
                    ]);
}

/**
 * Returns token expiration datetime.
 *
 * @return string Unixtmestamp
 */
private function getTokenExpiryDateTime()
{
    $tokenTtl = $this->container->getParameter('lexik_jwt_authentication.token_ttl');
    $now = new \DateTime();
    $now->add(new \DateInterval('PT'.$tokenTtl.'S'));

    return $now->format('U');
}
  /**
   * Set base HTTP headers.
   *
   * @param Response $response
   *
   * @return Response
   */
  private function setBaseHeaders(Response $response)
  {
      $response->headers->set('Content-Type', 'application/json');
      $response->headers->set('Access-Control-Allow-Origin', '*');

      return $response;
  }

/**
 * Data serializing via JMS serializer.
 *
 * @param mixed $data
 *
 * @return string JSON string
 */
public function serialize($data)
{
    $context = new SerializationContext();
    $context->setSerializeNull(true);

    return $this->get('jms_serializer')
        ->serialize($data, 'json', $context);
}


}
