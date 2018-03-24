<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use AppBundle\Entity\User;
use AppBundle\Form\UserType;

class DefaultController extends Controller
{
  /**
  * @Route("/", name="welcome")
  */
  public function showAction(Request $request)
  {

    $em = $this->getDoctrine()->getManager();

    $moustiques = $em->getRepository('AppBundle:User')->findAll();

    return $this->render('default/index.html.twig', array(
        'moustiques' => $moustiques,
    ));

  }

  /**
  * @Route("/profil", name="profil")
  */
  public function profilAction(Request $request)
  {

    $em = $this->getDoctrine()->getManager();
    $moustique = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());

    $editForm = $this->createForm('AppBundle\Form\UserType',$moustique[0]);
    $editForm->handleRequest($request);

    if ($editForm->isSubmitted() && $editForm->isValid()) {
      $this->getDoctrine()->getManager()->flush();

      return $this->redirectToRoute('welcome');
    }
    return $this->render('default/profil.html.twig', array(
      'edit_form' => $editForm->createView()
    ));

  }

  /**
  * @Route("/view/{id}", name="viewDefault")
  */
  public function viewAction(Request $request)
  {
    $id = $request->get('id');
    $em = $this->getDoctrine()->getManager();
    $moustique = $em->getRepository('AppBundle:User')->findById($id);

    return $this->render('default/view.html.twig', array(
      'moustique' => $moustique[0]
    ));

  }

  /**
  * @Route("/add/{id}", name="addDefault")
  */
  public function addAction(Request $request)
  {
    $id = $request->get('id');
    $em = $this->getDoctrine()->getManager();
    $moustiqueSource = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());
    $moustiqueCible = $em->getRepository('AppBundle:User')->findById($id);
    $moustiqueSource[0]->addMoustique($moustiqueCible[0]);
    $temp = $moustiqueSource[0]->getMoustiques();
    $em->persist($moustiqueSource[0]);
    $em->flush();
    return $this->render('default/my.html.twig',array(
      'moustiques' => $temp,
    ));

  }

  /**
  * @Route("/remove/{id}", name="removeDefault")
  */
  public function removeAction(Request $request)
  {
    $id = $request->get('id');
    $em = $this->getDoctrine()->getManager();
    $moustiqueSource = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());
    $moustiqueCible = $em->getRepository('AppBundle:User')->findById($id);
    $moustiqueSource[0]->removeMoustique($moustiqueCible[0]);
    $temp = $moustiqueSource[0]->getMoustiques();
    $em->persist($moustiqueSource[0]);
    $em->flush();
    return $this->render('default/my.html.twig',array(
      'moustiques' => $temp,
    ));

  }

  /**
  * @Route("/mes-moustiques", name="myList")
  */
  public function listAction(Request $request)
  {
    $em = $this->getDoctrine()->getManager();
    $moustiqueSource = $em->getRepository('AppBundle:User')->findById($this->getUser()->getId());

    $temp = $moustiqueSource[0]->getMoustiques();

    return $this->render('default/my.html.twig',array(
      'moustiques' => $temp,
    ));

  }

  /**
   * @Route("/login", name="loginDefault")
   */
  public function loginAction(Request $request)
  {
     $helper = $this->get('security.authentication_utils');

     return $this->render(
         'auth/login.html.twig',
         array(
             'last_username' => $helper->getLastUsername(),
             'error'         => $helper->getLastAuthenticationError(),
         )
     );
  }

  /**
   * @Route("/login_check", name="security_login_check")
   */
  public function loginCheckAction()
  {

  }

  /**
   * @Route("/logout", name="logoutDefault")
   */
  public function logoutAction()
  {

  }

  /**
   * @Route("/registering", name="registerDefault")
   */
  public function registerAction(Request $request)
  {
      // Create a new blank user and process the form
      $user = new User();
      $form = $this->createForm(UserType::class, $user);
      $form->handleRequest($request);

      if ($form->isSubmitted() && $form->isValid()) {
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

          return $this->redirectToRoute('loginDefault');
      }

      return $this->render('auth/register.html.twig', [
          'form' => $form->createView(),
      ]);
  }

}
